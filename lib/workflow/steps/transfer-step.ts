import { initiateTransfer } from '@/lib/squad/client';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { type TransferResult } from '@/types/transfer';

export interface TransferStepInput {
  run_id: string;
  receipt_id: string;
  amount: number;
  user_id: string;
  beneficiary_account: string;
  beneficiary_bank: string;
  beneficiary_name: string;
  narration: string;
}

export interface TransferStepOutput {
  transfer: TransferResult;
}

export async function executeTransferStep(
  input: TransferStepInput
): Promise<TransferStepOutput> {
  const {
    run_id,
    receipt_id,
    amount,
    user_id,
    beneficiary_account,
    beneficiary_bank,
    beneficiary_name,
    narration,
  } = input;

  // Call Squad API
  const squadResult = await initiateTransfer({
    run_id,
    receipt_id,
    amount,
    currency: 'NGN',
    beneficiary_account,
    beneficiary_bank,
    beneficiary_name,
    narration,
    trust_score: 0.8, // Placeholder, would come from trust report
  });

  // Save transfer record
  const supabase = await getSupabaseServiceRoleClient();
  const { data: savedTransfer } = await supabase
    .from('transfers')
    .insert({
      run_id,
      user_id,
      receipt_id,
      squad_reference: squadResult.squad_reference,
      amount,
      currency: 'NGN',
      beneficiary_account,
      beneficiary_bank,
      beneficiary_name,
      narration,
      status: squadResult.status,
      squad_response: squadResult.response_data,
      initiated_at: new Date().toISOString(),
    })
    .select()
    .single();

  // Log audit event
  await supabase.from('audit_events').insert({
    run_id,
    user_id,
    event_type: 'transfer.initiated',
    entity_type: 'transfer',
    entity_id: savedTransfer?.id,
    metadata: {
      squad_reference: squadResult.squad_reference,
      amount,
      beneficiary: beneficiary_name,
      status: squadResult.status,
    },
    severity: 'info',
  });

  return {
    transfer: {
      transfer_id: savedTransfer?.id || '',
      squad_reference: squadResult.squad_reference,
      status: squadResult.status as any,
      amount,
      currency: 'NGN',
      initiated_at: new Date().toISOString(),
      squad_response: squadResult.response_data,
    },
  };
}
