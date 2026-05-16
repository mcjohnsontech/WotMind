import type { AICheck } from '@/types/ai';
import type { GenericAIInput } from '../engine';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';

export async function checkVelocity(input: GenericAIInput): Promise<AICheck> {
  const startTime = Date.now();

  try {
    const supabase = await getSupabaseServiceRoleClient();
    const velocity_limit = input.ai_rules.velocity_limit || 5;
    const velocity_window_minutes = input.ai_rules.velocity_window_minutes || 60;

    // Count runs in the time window
    const window_start = new Date(Date.now() - velocity_window_minutes * 60 * 1000);

    const { count, error } = await supabase
      .from('automation_runs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', input.user_id)
      .eq('automation_type', input.automation_type)
      .gte('created_at', window_start.toISOString());

    if (error) {
      throw error;
    }

    const run_count = count || 0;
    const passed = run_count < velocity_limit;

    return {
      check_id: 'velocity',
      label: 'Rate Limit',
      passed,
      score: passed ? 1.0 : 0.0,
      detail: passed
        ? `${run_count}/${velocity_limit} executions in last ${velocity_window_minutes} minutes`
        : `Velocity limit exceeded: ${run_count} executions in last ${velocity_window_minutes} minutes (limit: ${velocity_limit})`,
      latency_ms: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Velocity check failed:', error);
    throw error;
  }
}
