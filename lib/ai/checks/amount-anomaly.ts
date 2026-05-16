import type { AICheck } from '@/types/ai';
import type { GenericAIInput } from '../engine';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { getPatterns } from '../pattern-learner';

export async function checkAmountAnomaly(input: GenericAIInput): Promise<AICheck> {
  const startTime = Date.now();

  try {
    // Get historical pattern for this automation type
    const pattern = await getPatterns(input.user_id, input.automation_type, 'amount_baseline');

    if (!pattern || pattern.sample_count < 3) {
      // Insufficient history - use default threshold
      const threshold = input.ai_rules.max_amount || 50000;
      const passed = input.amount <= threshold;
      const score = passed ? 1.0 : 0.3;

      return {
        check_id: 'amount_anomaly',
        label: 'Amount Anomaly',
        passed,
        score,
        detail: passed
          ? `Amount ₦${input.amount.toLocaleString()} within default threshold`
          : `Amount ₦${input.amount.toLocaleString()} exceeds default threshold of ₦${threshold.toLocaleString()}`,
        latency_ms: Date.now() - startTime,
      };
    }

    // Apply 2-sigma rule
    const threshold = pattern.mean + 2 * pattern.std_dev;
    const passed = input.amount <= threshold;
    const score = passed ? 1.0 : 0.2;

    return {
      check_id: 'amount_anomaly',
      label: 'Amount Anomaly',
      passed,
      score,
      detail: passed
        ? `Amount ₦${input.amount.toLocaleString()} within expected range (mean: ₦${Math.round(pattern.mean).toLocaleString()}, threshold: ₦${Math.round(threshold).toLocaleString()})`
        : `Amount ₦${input.amount.toLocaleString()} is anomalous (exceeds ₦${Math.round(threshold).toLocaleString()})`,
      latency_ms: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Amount anomaly check failed:', error);
    throw error;
  }
}
