import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { type TrustCheckResult } from '@/types/trust';

export async function checkDuplicate(
  imageHash: string,
  userId: string
): Promise<TrustCheckResult> {
  const start = Date.now();

  const supabase = await getSupabaseServiceRoleClient();

  const { data: existing } = await supabase
    .from('receipts')
    .select('id')
    .eq('image_hash', imageHash)
    .eq('user_id', userId)
    .limit(1);

  const passed = !existing || existing.length === 0;
  const latency = Date.now() - start;

  return {
    check_id: 'duplicate_check',
    label: 'Duplicate Detection',
    passed,
    score: passed ? 1.0 : 0.0,
    weight: 0.3,
    detail: passed
      ? 'Receipt not seen before'
      : 'Exact duplicate detected - same receipt image hash',
    latency_ms: latency,
  };
}
