import axios from 'axios';
import { normalizePhoneNumber } from './sms';

const WHATSAPP_API_URL = 'https://graph.instagram.com/v18.0/';

export interface WhatsAppComponent {
  type: 'body' | 'button';
  text?: string;
  parameters?: Array<{ type: string; text: string }>;
}

export async function sendWhatsAppMessage(
  to: string,
  templateName: string,
  components?: WhatsAppComponent[]
): Promise<{ message_id: string }> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiToken = process.env.WHATSAPP_API_TOKEN;

  if (!phoneNumberId || !apiToken) {
    throw new Error('WhatsApp credentials not configured');
  }

  const normalized_to = normalizePhoneNumber(to).replace('+', '');

  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: normalized_to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en_US' },
          components: components || [],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      message_id: response.data.messages[0].id,
    };
  } catch (error) {
    console.error('WhatsApp message send failed:', error);
    throw error;
  }
}
