import type { AIRules, DecisionVerdict } from '@/types/ai';

export function applyDecisionRules(
  risk_score: number,
  amount: number,
  ai_rules: AIRules,
  hard_blocked: boolean
): DecisionVerdict {
  // Hard block always trumps everything
  if (hard_blocked) {
    return 'blocked';
  }

  // High anomaly score always requires approval
  if (risk_score > (ai_rules.anomaly_score_threshold || 70)) {
    return 'require_approval';
  }

  // Respect max amount hard cap
  if (amount > ai_rules.max_amount) {
    return 'blocked';
  }

  // Auto-approve low amounts
  if (amount < (ai_rules.auto_approve_below || 10000)) {
    return 'auto_approve';
  }

  // Review-notify for mid-range with auto-execute after 30 min
  if (amount <= (ai_rules.require_approval_above || 100000)) {
    return 'review_notify';
  }

  // Require explicit approval for high amounts
  return 'require_approval';
}

export function calculateAutoApproveDelay(verdict: DecisionVerdict): number {
  // 30 minutes in milliseconds for review_notify verdicts
  if (verdict === 'review_notify') {
    return 30 * 60 * 1000;
  }
  return 0;
}
