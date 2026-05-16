export interface StaffMember {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone_number?: string;
  account_number: string;
  bank_code: string;
  bank_name?: string;
  base_salary: number;
  payment_type: 'monthly' | 'weekly' | 'daily' | 'per_task';
  department?: string;
  is_active: boolean;
  created_at: string;
}

export interface PayrollItem {
  staff_id: string;
  staff_name: string;
  account_number: string;
  bank_code: string;
  amount: number;
  narration: string;
}

export interface PayrollRun {
  id: string;
  automation_id: string;
  items: PayrollItem[];
  total_amount: number;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  completed_count: number;
  failed_count: number;
  created_at: string;
}
