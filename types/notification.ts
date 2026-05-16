export type NotificationChannel = 'sms' | 'whatsapp' | 'in_app';
export type MessageType = 'approval_request' | 'payment_confirmation' | 'alert' | 'receipt' | 'info';

export interface NotificationConfig {
  approval_phone: string;
  notify_on_complete: string;
  channels: NotificationChannel[];
  whatsapp_enabled: boolean;
}

export interface NotificationMessage {
  channel: NotificationChannel;
  recipient: string;
  message_type: MessageType;
  message_content: string;
  run_id?: string;
  user_id?: string;
}
