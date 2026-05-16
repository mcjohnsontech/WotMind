import type { AutomationType } from '@/types/automation';
import type { PatternData } from '@/types/ai';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';

export async function updatePatterns(
  user_id: string,
  automation_type: AutomationType,
  amount: number,
  approved: boolean
): Promise<void> {
  const supabase = await getSupabaseServiceRoleClient();
  const pattern_key = 'amount_baseline';

  // Get existing pattern or create new
  const { data: existing } = await supabase
    .from('ai_patterns')
    .select('*')
    .eq('user_id', user_id)
    .eq('automation_type', automation_type)
    .eq('pattern_key', pattern_key)
    .single();

  if (!existing) {
    // First data point
    const pattern_data: PatternData = {
      mean: amount,
      std_dev: 0,
      sample_count: 1,
      last_updated: new Date().toISOString(),
    };

    await supabase.from('ai_patterns').insert({
      user_id,
      automation_type,
      pattern_key,
      pattern_data,
      sample_count: 1,
    });
    return;
  }

  // Welford's online algorithm for incremental mean/variance
  const current_data = existing.pattern_data as PatternData;
  const n = current_data.sample_count;
  const old_mean = current_data.mean;
  const old_variance = current_data.std_dev ** 2;

  // New mean (using Welford's formula)
  const new_mean = old_mean + (amount - old_mean) / (n + 1);

  // New variance (using Welford's formula)
  const new_variance =
    (old_variance * n + (amount - old_mean) * (amount - new_mean)) / (n + 1);
  const new_std_dev = Math.sqrt(new_variance);

  const updated_data: PatternData = {
    mean: new_mean,
    std_dev: new_std_dev,
    sample_count: n + 1,
    last_updated: new Date().toISOString(),
  };

  await supabase
    .from('ai_patterns')
    .update({
      pattern_data: updated_data,
      sample_count: n + 1,
    })
    .eq('id', existing.id);
}

export async function getPatterns(
  user_id: string,
  automation_type: AutomationType,
  pattern_key: string
): Promise<PatternData | null> {
  const supabase = await getSupabaseServiceRoleClient();

  const { data } = await supabase
    .from('ai_patterns')
    .select('pattern_data')
    .eq('user_id', user_id)
    .eq('automation_type', automation_type)
    .eq('pattern_key', pattern_key)
    .single();

  return data ? (data.pattern_data as PatternData) : null;
}
