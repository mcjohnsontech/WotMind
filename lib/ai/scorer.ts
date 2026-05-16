import type { AICheck, RiskLevel } from '@/types/ai';

// Weights for each check (must sum to 1.0)
const WEIGHTS = {
  amount_anomaly: 0.25,
  velocity: 0.10,
  beneficiary: 0.20,
  custom_rules: 0.30,
  pattern_baseline: 0.15,
};

export function computeRiskScore(checks: AICheck[]): {
  risk_score: number;
  risk_level: RiskLevel;
} {
  let weighted_sum = 0;
  let total_weight = 0;

  for (const check of checks) {
    const weight = WEIGHTS[check.check_id as keyof typeof WEIGHTS] || 0.1;
    // Score is inverted: high check.score = low risk
    // So we use (1 - score) as the risk contribution
    const risk_contribution = (1 - check.score) * weight;
    weighted_sum += risk_contribution;
    total_weight += weight;
  }

  const risk_score = total_weight > 0 ? (weighted_sum / total_weight) * 100 : 0;

  let risk_level: RiskLevel = 'low';
  if (risk_score >= 70) {
    risk_level = 'critical';
  } else if (risk_score >= 50) {
    risk_level = 'high';
  } else if (risk_score >= 30) {
    risk_level = 'medium';
  }

  return { risk_score: Math.min(100, Math.max(0, risk_score)), risk_level };
}
