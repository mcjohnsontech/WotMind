import type { AICheck } from '@/types/ai';
import type { GenericAIInput } from '../engine';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';

export async function checkBeneficiary(input: GenericAIInput): Promise<AICheck> {
  const startTime = Date.now();

  try {
    if (!input.beneficiary_id) {
      // No beneficiary to check
      return {
        check_id: 'beneficiary',
        label: 'Beneficiary Risk',
        passed: true,
        score: 1.0,
        detail: 'No specific beneficiary to verify',
        latency_ms: Date.now() - startTime,
      };
    }

    const supabase = await getSupabaseServiceRoleClient();

    // Check if this beneficiary has been used before
    const { count, error } = await supabase
      .from('automation_runs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', input.user_id)
      .eq('automation_type', input.automation_type)
      .contains('input_data', { beneficiary_id: input.beneficiary_id });

    if (error) {
      throw error;
    }

    const is_known = (count || 0) > 0;
    const score = is_known ? 1.0 : 0.6;

    return {
      check_id: 'beneficiary',
      label: 'Beneficiary Risk',
      passed: true,
      score,
      detail: is_known
        ? `Known beneficiary (used ${count} times)`
        : `New beneficiary (first occurrence)`,
      latency_ms: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Beneficiary check failed:', error);
    throw error;
  }
}
