import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { type TrustCheckResult } from '@/types/trust';

export async function checkVendor(
  vendorName: string | null
): Promise<TrustCheckResult> {
  const start = Date.now();

  if (!vendorName) {
    return {
      check_id: 'vendor_check',
      label: 'Vendor Verification',
      passed: false,
      score: 0.0,
      weight: 0.2,
      detail: 'No vendor name detected in receipt',
      latency_ms: Date.now() - start,
    };
  }

  const supabase = await getSupabaseServiceRoleClient();

  const { data: vendors } = await supabase
    .from('approved_vendors')
    .select('name, trust_boost')
    .eq('is_active', true)
    .limit(100);

  let matched = false;
  let boostScore = 0;

  if (vendors && vendors.length > 0) {
    for (const vendor of vendors) {
      if (
        vendorName.toLowerCase().includes(vendor.name.toLowerCase()) ||
        vendor.name.toLowerCase().includes(vendorName.toLowerCase())
      ) {
        matched = true;
        boostScore = vendor.trust_boost;
        break;
      }
    }
  }

  const latency = Date.now() - start;

  return {
    check_id: 'vendor_check',
    label: 'Vendor Verification',
    passed: matched,
    score: matched ? 1.0 + boostScore : 0.4,
    weight: 0.2,
    detail: matched
      ? `Vendor "${vendorName}" is approved`
      : `Vendor "${vendorName}" not in approved list (unrecognized)`,
    latency_ms: latency,
  };
}
