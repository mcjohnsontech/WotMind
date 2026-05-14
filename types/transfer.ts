export interface TransferRequest {
  run_id: string;
  receipt_id: string;
  amount: number;
  currency: string;
  beneficiary_account: string;
  beneficiary_bank: string;
  beneficiary_name: string;
  narration: string;
  trust_score: number;
}

export interface TransferResult {
  transfer_id: string;
  squad_reference: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  amount: number;
  currency: string;
  initiated_at: string;
  squad_response: Record<string, unknown>;
}
