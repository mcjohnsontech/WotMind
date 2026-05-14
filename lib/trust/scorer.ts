import { type TrustCheckResult, type TrustReport, type TrustVerdict } from '@/types/trust';

const WEIGHTS: Record<string, number> = {
  duplicate_check: 0.30,
  vendor_check: 0.20,
  amount_anomaly: 0.25,
  ocr_confidence: 0.15,
  velocity_check: 0.10,
};

const HARD_BLOCKS = ['duplicate_check', 'velocity_check'];

export function computeTrustScore(
  checkResults: TrustCheckResult[]
): TrustReport {
  // Check for hard blocks
  const hardBlocked = checkResults.some(
    (r) =>
      !r.passed &&
      HARD_BLOCKS.includes(r.check_id)
  );

  if (hardBlocked) {
    const blockedCheck = checkResults.find(
      (r) => !r.passed && HARD_BLOCKS.includes(r.check_id)
    );

    return {
      overall_score: 0,
      verdict: 'blocked',
      check_results: checkResults,
      explanation: `Transaction blocked by ${blockedCheck?.label}: ${blockedCheck?.detail}`,
      blocked_reason: blockedCheck?.detail,
    };
  }

  // Calculate weighted score
  let totalWeightedScore = 0;
  for (const check of checkResults) {
    const weight = WEIGHTS[check.check_id] || 0;
    totalWeightedScore += check.score * weight;
  }

  // Normalize to 0-1
  const overall_score = Math.max(0, Math.min(1, totalWeightedScore));

  // Determine verdict based on thresholds
  const blockThreshold = parseFloat(
    process.env.TRUST_BLOCK_THRESHOLD || '0.40'
  );
  const flagThreshold = parseFloat(
    process.env.TRUST_FLAG_THRESHOLD || '0.70'
  );

  let verdict: TrustVerdict;
  if (overall_score >= flagThreshold) {
    verdict = 'approved';
  } else if (overall_score >= blockThreshold) {
    verdict = 'flagged';
  } else {
    verdict = 'blocked';
  }

  const explanation = formatExplanation(checkResults, overall_score, verdict);

  return {
    overall_score,
    verdict,
    check_results: checkResults,
    explanation,
  };
}

function formatExplanation(
  checks: TrustCheckResult[],
  score: number,
  verdict: TrustVerdict
): string {
  const passed = checks.filter((c) => c.passed).length;
  const total = checks.length;

  let baseMsg = `Trust score: ${(score * 100).toFixed(1)}% (${passed}/${total} checks passed)`;

  if (verdict === 'approved') {
    return baseMsg + ' • Transaction APPROVED for execution';
  } else if (verdict === 'flagged') {
    return baseMsg + ' • Transaction FLAGGED for review (borderline risk detected)';
  } else {
    const failedChecks = checks
      .filter((c) => !c.passed)
      .map((c) => c.label)
      .join(', ');
    return baseMsg + ` • Transaction BLOCKED (failed: ${failedChecks})`;
  }
}
