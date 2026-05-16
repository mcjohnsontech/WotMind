import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { pingSquad } from '@/lib/squad/client';
import { pingTwilio } from '@/lib/notifications/sms';
import { pingWhatsApp } from '@/lib/notifications/whatsapp';

interface CheckResult {
  service: string;
  ok: boolean;
  message: string;
  required_env: string[];
}

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const checks: CheckResult[] = [];

  // Run all pings in parallel
  const [squadRes, twilioRes, whatsappRes] = await Promise.allSettled([
    pingSquad(),
    pingTwilio(),
    pingWhatsApp(),
  ]);

  function unwrap(r: PromiseSettledResult<{ ok: boolean; message: string }>) {
    if (r.status === 'fulfilled') return r.value;
    return { ok: false, message: r.reason instanceof Error ? r.reason.message : 'unknown error' };
  }

  checks.push({
    service: 'Squad Payments',
    required_env: ['SQUAD_SECRET_KEY'],
    ...unwrap(squadRes),
  });
  checks.push({
    service: 'Twilio SMS',
    required_env: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'],
    ...unwrap(twilioRes),
  });
  checks.push({
    service: 'WhatsApp (Twilio)',
    required_env: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_WHATSAPP_NUMBER'],
    ...unwrap(whatsappRes),
  });

  // Other env-only checks
  checks.push({
    service: 'Gemini AI',
    required_env: ['GEMINI_API_KEY'],
    ok: Boolean(process.env.GEMINI_API_KEY),
    message: process.env.GEMINI_API_KEY ? 'API key configured' : 'GEMINI_API_KEY not set',
  });
  checks.push({
    service: 'OpenRouter AI',
    required_env: ['OPENROUTER_API_KEY'],
    ok: Boolean(process.env.OPENROUTER_API_KEY),
    message: process.env.OPENROUTER_API_KEY
      ? 'API key configured'
      : 'OPENROUTER_API_KEY not set (optional — Gemini fallback will be used)',
  });
  checks.push({
    service: 'Supabase',
    required_env: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
    ok: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
    message: 'Connection used in this request — if you reached this endpoint, Supabase auth works',
  });

  return NextResponse.json({ checks });
}

interface SendTestRequest {
  channel: 'sms' | 'whatsapp';
  recipient: string;
}

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body: SendTestRequest = await request.json();
  if (!body.recipient) {
    return NextResponse.json({ error: 'Recipient required' }, { status: 400 });
  }

  const testMessage = `WOTMIND test message at ${new Date().toLocaleTimeString('en-NG')}. If you got this, the ${body.channel.toUpperCase()} channel works.`;

  try {
    if (body.channel === 'sms') {
      const { sendSMS } = await import('@/lib/notifications/sms');
      const result = await sendSMS(body.recipient, testMessage);
      return NextResponse.json({ ok: true, channel: 'sms', external_id: result.sid });
    } else if (body.channel === 'whatsapp') {
      const { sendWhatsAppMessage } = await import('@/lib/notifications/whatsapp');
      const result = await sendWhatsAppMessage(body.recipient, testMessage);
      return NextResponse.json({
        ok: true,
        channel: 'whatsapp',
        delivery: result.channel,
        external_id: result.message_id,
      });
    }
    return NextResponse.json({ error: 'Unknown channel' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'Send failed',
      },
      { status: 500 }
    );
  }
}
