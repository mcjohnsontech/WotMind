import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { sendWhatsAppMessage } from '@/lib/notifications/whatsapp';
import { normalizePhoneNumber } from '@/lib/notifications/sms';

/**
 * Twilio WhatsApp inbound webhook.
 * Configure this URL in your Twilio console:
 *   WhatsApp → Sandbox (or sender) → "WHEN A MESSAGE COMES IN" → POST
 *   https://yourdomain.com/api/webhooks/whatsapp
 *
 * User just replies YES or NO to the approval message — no token needed.
 * We find the latest pending approval for their phone number.
 */

function validateTwilioSignature(request: NextRequest, body: string): boolean {
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!token) return false;

  const signature = request.headers.get('x-twilio-signature') || '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const url = `${appUrl}/api/webhooks/whatsapp`;

  const params = Object.fromEntries(new URLSearchParams(body));

  try {
    const twilio = require('twilio');
    return twilio.validateRequest(token, signature, url, params);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  // Skip signature check in dev — Twilio can't reach localhost
  const isDev = process.env.NODE_ENV === 'development';
  if (!isDev && !validateTwilioSignature(request, rawBody)) {
    console.warn('WhatsApp webhook: invalid Twilio signature');
    // Return 200 so Twilio stops retrying, but log the issue
    return new NextResponse('', { status: 200 });
  }

  try {
    const params = new URLSearchParams(rawBody);
    const rawBody_text = params.get('Body')?.trim() || '';
    const from_raw = params.get('From') || '';

    // Twilio sends whatsapp:+234... — strip the prefix to get a plain number
    const from_wa_number = from_raw; // keep for reply
    const from_phone = from_raw.replace(/^whatsapp:/, '');
    const normalised = normalizePhoneNumber(from_phone);

    const reply = async (msg: string) => {
      await sendWhatsAppMessage(from_wa_number, msg).catch((e) =>
        console.error('WhatsApp reply failed:', e.message)
      );
    };

    // Accept YES / NO (plain, case-insensitive)
    const word = rawBody_text.toUpperCase().split(/\s/)[0];
    if (word !== 'YES' && word !== 'NO') {
      // Not an approval reply — ignore silently
      return new NextResponse('', { status: 200 });
    }

    const decision = word === 'YES' ? 'approved' : 'rejected';
    const supabase = await getSupabaseServiceRoleClient();

    // Find the latest pending approval for this phone number
    // The context JSON stores the phone as it was entered, which may differ
    // in format — so we match on both the raw and normalised versions.
    const { data: candidates } = await supabase
      .from('approval_tokens')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .is('used_at', null)
      .order('created_at', { ascending: false })
      .limit(10); // small scan, we'll filter below

    const token_record = candidates?.find((t) => {
      const stored = String(t.context?.phone_number || '');
      try {
        return (
          normalizePhoneNumber(stored) === normalised ||
          stored === from_phone ||
          stored === normalised
        );
      } catch {
        return false;
      }
    });

    if (!token_record) {
      await reply(
        `WOTMIND: No pending approval found for this number. Either it already expired or was already actioned.`
      );
      return new NextResponse('', { status: 200 });
    }

    const userId = token_record.user_id as string;

    // Mark token used
    await supabase
      .from('approval_tokens')
      .update({ used_at: new Date().toISOString(), decision })
      .eq('id', token_record.id);

    if (decision === 'approved') {
      await supabase
        .from('automation_runs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          approval_responded_at: new Date().toISOString(),
          approved_by: normalised,
          result_data: { message: 'Approved via WhatsApp reply' },
        })
        .eq('id', token_record.run_id);

      await reply(`WOTMIND: ✓ Approved. The transaction will now execute.`);

      // Audit log
      supabase.from('audit_events').insert({
        user_id: userId,
        run_id: token_record.run_id,
        event_type: 'approval.approved',
        entity_type: 'automation_run',
        entity_id: token_record.run_id,
        metadata: { channel: 'whatsapp', phone: normalised },
        severity: 'info',
      });
    } else {
      await supabase
        .from('automation_runs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          approval_responded_at: new Date().toISOString(),
          approved_by: normalised,
          error_message: 'Rejected via WhatsApp reply',
        })
        .eq('id', token_record.run_id);

      await reply(`WOTMIND: ✗ Rejected. No money was transferred.`);

      supabase.from('audit_events').insert({
        user_id: userId,
        run_id: token_record.run_id,
        event_type: 'approval.rejected',
        entity_type: 'automation_run',
        entity_id: token_record.run_id,
        metadata: { channel: 'whatsapp', phone: normalised },
        severity: 'warn',
      });
    }

    return new NextResponse('', { status: 200 });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return new NextResponse('', { status: 200 });
  }
}
