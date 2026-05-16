export type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'paid';
export type ExpenseCategory = 'transport' | 'meals' | 'utilities' | 'supplies' | 'other';

export interface ExpenseSubmission {
  id: string;
  automation_id: string;
  user_id: string;
  submitter_name: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  receipt_url?: string;
  status: ExpenseStatus;
  ai_fraud_score?: number;
  ai_verdict?: string;
  created_at: string;
}
