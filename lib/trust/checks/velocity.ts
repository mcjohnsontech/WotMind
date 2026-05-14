import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { type TrustCheckResult } from '@/types/trust';

export async function checkVelocity(
  userId: string
): Promise<TrustCheckResult> {
  const start = Date.now();

  const supabase = await getSupabaseServiceRoleClient();

  const windowMinutes = parseInt(
    process.env.TRUST_VELOCITY_WINDOW_MINUTES || '60'
  );
  const limit = parseInt(process.env.TRUST_VELOCITY_LIMIT || '5');

  const thresholdTime = new Date(
    Date.now() - windowMinutes * 60 * 1000
  ).toISOString();

  const { data: recentRuns } = await supabase
    .from('workflow_runs')
    .select('id')
    .eq('user_id', userId)
    .gte('created_at', thresholdTime);

  const count = recentRuns?.length || 0;
  const passed = count < limit;
  const latency = Date.now() - start;

  return {
    check_id: 'velocity_check',
    label: 'Velocity Check',
    passed,
    score: passed ? 1.0 : 0.0,
    weight: 0.1,
    detail: passed
      ? `${count} runs in last ${windowMinutes} min (limit: ${limit})`
      : `VELOCITY EXCEEDED: ${count} runs in last ${windowMinutes} min (limit: ${limit})`,
    latency_ms: latency,
  };
}
