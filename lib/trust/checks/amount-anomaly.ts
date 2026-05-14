import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { type TrustCheckResult } from '@/types/trust';

export async function checkAmountAnomaly(
  amount: number | null,
  userId: string
): Promise<TrustCheckResult> {
  const start = Date.now();

  if (!amount || amount <= 0) {
    return {
      check_id: 'amount_anomaly',
      label: 'Amount Anomaly Detection',
      passed: false,
      score: 0.0,
      weight: 0.25,
      detail: 'Invalid or missing amount',
      latency_ms: Date.now() - start,
    };
  }

  const supabase = await getSupabaseServiceRoleClient();

  // Get last 30 receipts
  const { data: receipts } = await supabase
    .from('receipts')
    .select('amount')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);

  const latency = Date.now() - start;

  // If fewer than 3 historical receipts, use default limit from env
  if (!receipts || receipts.length < 3) {
    const defaultLimit = parseFloat(
      process.env.TRUST_DEFAULT_AMOUNT_LIMIT || '50000'
    );
    const passed = amount <= defaultLimit;

    return {
      check_id: 'amount_anomaly',
      label: 'Amount Anomaly Detection',
      passed,
      score: passed ? 1.0 : 0.3,
      weight: 0.25,
      detail: passed
        ? `Amount ${amount} within default limit (${defaultLimit})`
        : `Amount ${amount} exceeds default limit (${defaultLimit})`,
      latency_ms: latency,
    };
  }

  // Calculate mean and standard deviation
  const amounts = receipts.map((r) => r.amount || 0).filter((a) => a > 0);
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance =
    amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    amounts.length;
  const stdDev = Math.sqrt(variance);

  // 2-sigma rule: flag if > mean + 2*sigma
  const threshold = mean + 2 * stdDev;
  const passed = amount <= threshold;

  return {
    check_id: 'amount_anomaly',
    label: 'Amount Anomaly Detection',
    passed,
    score: passed ? 1.0 : 0.2,
    weight: 0.25,
    detail: passed
      ? `Amount ${amount} is normal (mean: ${mean.toFixed(2)}, threshold: ${threshold.toFixed(2)})`
      : `Amount ${amount} is ANOMALOUS (exceeds 2-sigma: ${threshold.toFixed(2)})`,
    latency_ms: latency,
  };
}
