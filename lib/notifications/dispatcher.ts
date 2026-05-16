import type { NotificationMessage } from '@/types/notification';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { sendSMS } from './sms';
import { sendWhatsAppMessage } from './whatsapp';

export async function dispatch(message: NotificationMessage): Promise<void> {
  const supabase = await getSupabaseServiceRoleClient();

  // Log the notification intent
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
      const wa_result = await sendWhatsAppMessage(message.recipient, 'message_template');
      external_id = wa_result.message_id;
    } else if (message.channel === 'in_app') {
      // In-app notifications are handled by Supabase Realtime
      // Just mark as sent here
      external_id = log?.id || '';
    }

    // Update log with success
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
    console.error('Notification dispatch failed:', error);

    // Mark as failed in log
    if (log) {
      await supabase
        .from('notification_log')
        .update({
          status: 'failed',
        })
        .eq('id', log.id);
    }

    throw error;
  }
}
