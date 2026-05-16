import type { NotificationMessage } from '@/types/notification';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { sendSMS } from './sms';
import { sendWhatsAppMessage } from './whatsapp';

export async function dispatch(message: NotificationMessage): Promise<void> {
  const supabase = await getSupabaseServiceRoleClient();

  const { data: log } = await supabase
    .from('notification_log')
    .insert({
      user_id: message.user_id,
      run_id: message.run_id,
      channel: message.channel,
      recipient: message.recipient,
      message_type: message.message_type,
      message_content: message.message_content,
      status: 'pending',
    })
    .select()
    .single();

  try {
    let external_id = '';

    if (message.channel === 'sms') {
      const sms_result = await sendSMS(message.recipient, message.message_content);
      external_id = sms_result.sid;
    } else if (message.channel === 'whatsapp') {
      const wa_result = await sendWhatsAppMessage(
        message.recipient,
        message.message_content
      );
      external_id = wa_result.message_id;
    } else if (message.channel === 'in_app') {
      external_id = log?.id || '';
    }

    if (log) {
      await supabase
        .from('notification_log')
        .update({
          status: 'sent',
          external_id,
          sent_at: new Date().toISOString(),
        })
        .eq('id', log.id);
    }
  } catch (error) {
    console.error('Notification dispatch failed:', {
      channel: message.channel,
      recipient: message.recipient,
      error: error instanceof Error ? error.message : error,
    });

    if (log) {
      await supabase
        .from('notification_log')
        .update({
          status: 'failed',
          message_content:
            (message.message_content || '') +
            `\n\n[error: ${error instanceof Error ? error.message : 'unknown'}]`,
        })
        .eq('id', log.id);
    }

    throw error;
  }
}
