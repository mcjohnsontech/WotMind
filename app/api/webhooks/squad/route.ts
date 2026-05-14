import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify webhook signature (Squad sends HMAC)
    const signature = request.headers.get('x-squad-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    const secret = process.env.SQUAD_WEBHOOK_SECRET || '';
    const payload = JSON.stringify(body);
    const hmac = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (hmac !== signature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Process webhook
    const { transaction_reference, status, amount } = body;

    if (!transaction_reference) {
      return NextResponse.json(
        { error: 'Missing transaction_reference' },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseServiceRoleClient();

    // Update transfer record
    const { data: transfer } = await supabase
      .from('transfers')
      .update({
        status,
        squad_response: body,
        confirmed_at:
          status === 'success' ? new Date().toISOString() : undefined,
      })
      .eq('squad_reference', transaction_reference)
      .select()
      .single();

    if (transfer && transfer.run_id) {
      // Log audit event
      await supabase.from('audit_events').insert({
        run_id: transfer.run_id,
        user_id: transfer.user_id,
        event_type:
          status === 'success' ? 'transfer.confirmed' : 'transfer.failed',
        entity_type: 'transfer',
        entity_id: transfer.id,
        metadata: {
          squad_reference: transaction_reference,
          amount,
          status,
        },
        severity: status === 'success' ? 'info' : 'warn',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Always return 200 to prevent Squad from retrying
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
