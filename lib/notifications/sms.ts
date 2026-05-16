import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
const fromNumber = process.env.TWILIO_PHONE_NUMBER || '';

const client = twilio(accountSid, authToken);

// Normalize Nigerian phone numbers to +234 format
export function normalizePhoneNumber(phone: string): string {
  let normalized = phone.trim();

  // Remove any leading +
  if (normalized.startsWith('+')) {
    normalized = normalized.substring(1);
  }

  // Handle 080XXXXXXXX format (local format)
  if (normalized.startsWith('080') || normalized.startsWith('070') || normalized.startsWith('090')) {
    normalized = '234' + normalized.substring(1);
  }

  // Handle 2348XXXXXXXX format (already has country code)
  if (!normalized.startsWith('+234')) {
    normalized = '+234' + (normalized.startsWith('234') ? normalized.substring(3) : normalized);
  } else {
    normalized = '+' + normalized;
  }

  return normalized;
}

export async function sendSMS(to: string, message: string): Promise<{ sid: string; status: string }> {
  const normalized_to = normalizePhoneNumber(to);

  const result = await client.messages.create({
    body: message,
    from: fromNumber,
    to: normalized_to,
  });

  return {
    sid: result.sid,
    status: result.status,
  };
}

export async function sendApprovalRequest(
  to: string,
  run_id: string,
  amount: number,
  description: string,
  approval_token: string
): Promise<{ sid: string }> {
  const formatted_amount = `₦${amount.toLocaleString('en-NG')}`;
  const app_url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const message = `WOTMIND: Approve ${formatted_amount} for "${description}"? Reply YES-${approval_token} to approve or NO-${approval_token} to reject. Expires in 1 hour.`;

  const result = await sendSMS(to, message);
  return { sid: result.sid };
}
