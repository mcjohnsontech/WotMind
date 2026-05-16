import type { Twilio } from 'twilio';

let _client: Twilio | null = null;
let _initialized = false;

/**
 * Lazy-init Twilio so missing env vars don't crash at import time.
 * Returns null if credentials are not configured.
 */
function getTwilioClient(): Twilio | null {
  if (_initialized) return _client;
  _initialized = true;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  // Require twilio inline so the SDK doesn't validate creds at import
  const twilio = require('twilio') as (sid: string, token: string) => Twilio;
  _client = twilio(sid, token);
  return _client;
}

function getFromNumber(): string {
  return process.env.TWILIO_PHONE_NUMBER || '';
}

/**
 * Normalize a Nigerian phone number to E.164 (+234XXXXXXXXXX).
 * Accepts: 080..., 234..., +234..., 8012345678 (10-digit no prefix).
 */
export function normalizePhoneNumber(phone: string): string {
  let n = (phone || '').replace(/[\s\-()]/g, '');
  if (n.startsWith('+')) n = n.slice(1);
  // Local 11-digit format: 080..., 070..., 090..., 081...
  if (/^0[789]\d{9}$/.test(n)) {
    n = '234' + n.slice(1);
  }
  // 10-digit without leading 0 (e.g. 8012345678)
  if (/^[789]\d{9}$/.test(n)) {
    n = '234' + n;
  }
  // Strip any duplicate 234234 that could come from concat
  n = n.replace(/^234234/, '234');
  // At this point we expect 234XXXXXXXXXX (13 digits)
  return '+' + n;
}

export async function sendSMS(
  to: string,
  message: string
): Promise<{ sid: string; status: string }> {
  const client = getTwilioClient();
  const from = getFromNumber();

  if (!client) {
    throw new Error('SMS provider not configured: set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
  }
  if (!from) {
    throw new Error('SMS provider not configured: set TWILIO_PHONE_NUMBER');
  }

  const normalized = normalizePhoneNumber(to);

  try {
    const result = await client.messages.create({
      body: message,
      from,
      to: normalized,
    });
    return { sid: result.sid, status: result.status };
  } catch (err) {
    const e = err as Error & { code?: number; status?: number; moreInfo?: string };
    const detail = e.code ? ` (code ${e.code})` : '';
    const more = e.moreInfo ? ` - see ${e.moreInfo}` : '';
    throw new Error(`SMS send failed${detail}: ${e.message}${more}`);
  }
}

export async function sendApprovalRequest(
  to: string,
  _run_id: string,
  amount: number,
  description: string,
  approval_token: string
): Promise<{ sid: string }> {
  const formatted_amount = `₦${amount.toLocaleString('en-NG')}`;
  const message = `WOTMIND: Approve ${formatted_amount} for "${description}"? Reply YES-${approval_token} to approve or NO-${approval_token} to reject. Expires in 1 hour.`;
  const result = await sendSMS(to, message);
  return { sid: result.sid };
}

/**
 * Diagnostic ping. Calls Twilio's account fetch with the configured creds —
 * succeeds iff the SID + token are valid. Does NOT send a real SMS.
 */
export async function pingTwilio(): Promise<{ ok: boolean; message: string }> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!sid) return { ok: false, message: 'TWILIO_ACCOUNT_SID not set' };
  if (!token) return { ok: false, message: 'TWILIO_AUTH_TOKEN not set' };
  if (!from) return { ok: false, message: 'TWILIO_PHONE_NUMBER not set' };

  try {
    const client = getTwilioClient()!;
    const account = await client.api.v2010.accounts(sid).fetch();
    return {
      ok: true,
      message: `Connected to Twilio account "${account.friendlyName}" (${account.status}), from ${from}`,
    };
  } catch (err) {
    const e = err as Error & { code?: number; status?: number };
    return {
      ok: false,
      message: `Twilio auth failed${e.code ? ` (code ${e.code})` : ''}: ${e.message}`,
    };
  }
}
