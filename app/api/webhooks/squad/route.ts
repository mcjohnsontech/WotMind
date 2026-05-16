import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';

/**
 * Squad webhook handler.
 * Squad signs each webhook with HMAC-SHA512(secret_key, raw_body) and sends
 * the hex digest in the `x-squad-encrypted-body` header.
 * Always returns 200 to prevent Squad's retry storms; we mark internal errors
 * in the audit log instead.
 */
export async function POST(request: NextRequest) {
  // We need the raw body bytes for HMAC verification — JSON.stringify on a
  // parsed body re-orders keys and breaks the signature.
  const rawBody = await request.text();

  try {
    const secret = process.env.SQUAD_SECRET_KEY || process.env.SQUAD_WEBHOOK_SECRET || '';
    if (!secret) {
      console.error('Squad webhook: no secret key configured');
      return NextResponse.json({ success: false, error: 'server misconfigured' }, { status: 200 });
    }

    const signature = request.headers.get('x-squad-encrypted-body');
    if (!signature) {
      console.warn('Squad webhook: missing x-squad-encrypted-body header');
      return NextResponse.json({ success: false, error: 'missing signature' }, { status: 200 });
    }

    const expected = createHmac('sha512', secret).update(rawBody).digest('hex');

    // Constant-time comparison
    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      console.warn('Squad webhook: signature mismatch', {
        sig_len: sigBuf.length,
        exp_len: expBuf.length,
      });
      return NextResponse.json({ success: false, error: 'invalid signature' }, { status: 200 });
    }

    const body = JSON.parse(rawBody);

    // Squad payloads come in two flavors depending on event type. Pull
    // transaction_reference from the most common locations.
    const ref =
      body.transaction_reference ||
      body.data?.transaction_reference ||
      body.Body?.transaction_reference;
    const status =
      body.transaction_status ||
      body.status ||
      body.data?.transaction_status;
    const amountKobo =
      Number(body.amount ?? body.data?.amount ?? 0);

    if (!ref) {
      console.warn('Squad webhook: missing transaction_reference', body);
      return NextResponse.json({ success: false, error: 'missing reference' }, { status: 200 });
    }

    const supabase = await getSupabaseServiceRoleClient();

    const isSuccess = String(status).toLowerCase() === 'success';
    const { data: transfer } = await supabase
      .from('transfers')
      .update({
        status: isSuccess ? 'success' : String(status || 'failed').toLowerCase(),
        squad_response: body,
        confirmed_at: isSuccess ? new Date().toISOString() : undefined,
      })
      .eq('squad_reference', ref)
      .select()
      .single();

    if (transfer && transfer.run_id) {
      await supabase.from('audit_events').insert({
        run_id: transfer.run_id,
        user_id: transfer.user_id,
        event_type: isSuccess ? 'transfer.confirmed' : 'transfer.failed',
        entity_type: 'transfer',
        entity_id: transfer.id,
        metadata: {
          squad_reference: ref,
          amount_naira: amountKobo / 100,
          status,
        },
        severity: isSuccess ? 'info' : 'warn',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Squad webhook processing error:', error, { rawBody });
    // Always return 200 so Squad doesn't retry indefinitely
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
