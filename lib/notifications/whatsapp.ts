import { normalizePhoneNumber } from './sms';
import type { Twilio } from 'twilio';

/**
 * WhatsApp via Twilio.
 * Uses the same Twilio credentials as SMS — just prefixes numbers with
 * "whatsapp:" and uses your Twilio WhatsApp sender number.
 *
 * Sandbox sender (for testing): +14155238886
 * Production: a Twilio-approved WhatsApp Business number.
 *
 * Required env vars:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_WHATSAPP_NUMBER   e.g. +14155238886  (sandbox) or your approved number
 */

let _client: Twilio | null = null;
let _initialized = false;

function getTwilioClient(): Twilio | null {
  if (_initialized) return _client;
  _initialized = true;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  const twilio = require('twilio') as (sid: string, token: string) => Twilio;
  _client = twilio(sid, token);
  return _client;
}

function getFromNumber(): string {
  const num = process.env.TWILIO_WHATSAPP_NUMBER || '';
  // normalise — ensure whatsapp: prefix
  if (!num) return '';
  const plain = num.replace(/^whatsapp:/, '');
  return `whatsapp:${plain}`;
}

function toWhatsAppAddress(phone: string): string {
  const plain = normalizePhoneNumber(phone); // → +234XXXXXXXXXX
  return `whatsapp:${plain}`;
}

export async function sendWhatsAppMessage(
  to: string,
  body: string
): Promise<{ message_id: string; channel: 'text' }> {
  const client = getTwilioClient();
  const from = getFromNumber();

  if (!client) {
    throw new Error(
      'WhatsApp not configured: set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN'
    );
  }
  if (!from || from === 'whatsapp:') {
    throw new Error(
      'WhatsApp not configured: set TWILIO_WHATSAPP_NUMBER (e.g. +14155238886 for sandbox)'
    );
  }

  try {
    const result = await client.messages.create({
      from,
      to: toWhatsAppAddress(to),
      body,
    });
    return { message_id: result.sid, channel: 'text' };
  } catch (err) {
    const e = err as Error & { code?: number; moreInfo?: string };
    const detail = e.code ? ` (Twilio code ${e.code})` : '';
    const more = e.moreInfo ? ` — ${e.moreInfo}` : '';
    throw new Error(`WhatsApp send failed${detail}: ${e.message}${more}`);
  }
}

export async function pingWhatsApp(): Promise<{ ok: boolean; message: string }> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const waNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!sid) return { ok: false, message: 'TWILIO_ACCOUNT_SID not set' };
  if (!token) return { ok: false, message: 'TWILIO_AUTH_TOKEN not set' };
  if (!waNumber) return { ok: false, message: 'TWILIO_WHATSAPP_NUMBER not set (use +14155238886 for sandbox)' };

  try {
    const client = getTwilioClient()!;
    // Verify creds are valid by fetching the account — no message sent
    const account = await client.api.v2010.accounts(sid).fetch();
    return {
      ok: true,
      message: `Twilio WhatsApp ready. Account: "${account.friendlyName}", sender: ${waNumber}`,
    };
  } catch (err) {
    const e = err as Error & { code?: number };
    return {
      ok: false,
      message: `Twilio auth failed${e.code ? ` (code ${e.code})` : ''}: ${e.message}`,
    };
  }
}
