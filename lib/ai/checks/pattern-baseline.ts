import type { AICheck } from '@/types/ai';
import type { GenericAIInput } from '../engine';
import { getPatterns } from '../pattern-learner';

export async function checkPatternBaseline(input: GenericAIInput): Promise<AICheck> {
  const startTime = Date.now();

  try {
    // Get historical pattern for this automation type
    const pattern = await getPatterns(input.user_id, input.automation_type, 'amount_baseline');

    if (!pattern || pattern.sample_count < 5) {
      // Insufficient history to evaluate against baseline
      return {
        check_id: 'pattern_baseline',
        label: 'Pattern Baseline',
        passed: true,
        score: 1.0,
        detail:
          pattern && pattern.sample_count > 0
            ? `Limited history: ${pattern.sample_count} samples`
            : 'No historical data available',
        latency_ms: Date.now() - startTime,
      };
    }

    // Check if amount deviates significantly from learned baseline
    const deviation = Math.abs(input.amount - pattern.mean) / (pattern.std_dev || 1);
    const is_within_baseline = deviation <= 3; // 3 sigma (99.7% confidence)

    return {
      check_id: 'pattern_baseline',
      label: 'Pattern Baseline',
      passed: is_within_baseline,
      score: is_within_baseline ? 1.0 : 0.6,
      detail: is_within_baseline
        ? `Amount aligns with learned baseline (deviation: ${deviation.toFixed(2)}σ)`
        : `Amount deviates from baseline (${deviation.toFixed(2)}σ from mean)`,
      latency_ms: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Pattern baseline check failed:', error);
    throw error;
  }
}
