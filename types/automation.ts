import type { AIRules } from './ai';
import type { NotificationConfig } from './notification';

export type AutomationType =
  | 'receipt_reimbursement'
  | 'payroll'
  | 'expense'
  | 'invoice'
  | 'inventory'
  | 'batch_design'
  | 'vendor_payment'
  | 'salary_advance';

export type AutomationStatus = 'active' | 'paused' | 'archived';

export type RunStatus =
  | 'pending'
  | 'running'
  | 'awaiting_approval'
  | 'completed'
  | 'failed'
  | 'blocked';

export interface Automation {
  id: string;
  user_id: string;
  name: string;
  automation_type: AutomationType;
  config: Record<string, unknown>;
  ai_rules: AIRules;
  notification_config: NotificationConfig;
  status: AutomationStatus;
  created_at: string;
  updated_at: string;
}

export interface AutomationRun {
  id: string;
  automation_id: string;
  user_id: string;
  automation_type: AutomationType;
  status: RunStatus;
  input_data?: Record<string, unknown>;
  ai_assessment?: any;
  result_data?: Record<string, unknown>;
  error_message?: string;
  approval_requested_at?: string;
  approval_responded_at?: string;
  approved_by?: string;
  created_at: string;
  completed_at?: string;
}
