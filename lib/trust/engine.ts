import { computeTrustScore } from './scorer';
import { checkDuplicate } from './checks/duplicate';
import { checkVendor } from './checks/vendor';
import { checkAmountAnomaly } from './checks/amount-anomaly';
import { checkOcrConfidence } from './checks/ocr-confidence';
import { checkVelocity } from './checks/velocity';
import { type TrustEngineInput, type TrustReport } from '@/types/trust';

export async function runTrustEngine(
  input: TrustEngineInput
): Promise<TrustReport> {
  const { receipt, image_hash, user_id, run_id } = input;

  // Run all checks in parallel
  const results = await Promise.allSettled([
    checkDuplicate(image_hash, user_id),
    checkVendor(receipt.vendor_name),
    checkAmountAnomaly(receipt.amount, user_id),
    checkOcrConfidence(receipt.confidence),
    checkVelocity(user_id),
  ]);

  // Convert results to array, handling errors
  const checks = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      // Return a failed check if something goes wrong
      const checkIds = [
        'duplicate_check',
        'vendor_check',
        'amount_anomaly',
        'ocr_confidence',
        'velocity_check',
      ];
      return {
        check_id: checkIds[index] as any,
        label: checkIds[index],
        passed: false,
        score: 0,
        weight: 0.2,
        detail: `Error: ${result.reason.message || 'Check failed'}`,
        latency_ms: 0,
      };
    }
  });

  // Score and return verdict
  return computeTrustScore(checks);
}
