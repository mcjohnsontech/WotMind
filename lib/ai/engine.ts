import type { AutomationType } from '@/types/automation';
import type { AIRules, RiskAssessment, AICheck } from '@/types/ai';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { checkAmountAnomaly } from './checks/amount-anomaly';
import { checkVelocity } from './checks/velocity';
import { checkBeneficiary } from './checks/beneficiary';
import { checkCustomRules } from './checks/custom-rules';
import { checkPatternBaseline } from './checks/pattern-baseline';
import { computeRiskScore } from './scorer';
import { applyDecisionRules } from './decision-rules';

export interface GenericAIInput {
  amount: number;
  user_id: string;
  automation_type: AutomationType;
  automation_id: string;
  run_id: string;
  beneficiary_id?: string;
  beneficiary_name?: string;
  custom_data?: Record<string, unknown>;
  ai_rules: AIRules;
}

export async function runAIEngine(input: GenericAIInput): Promise<RiskAssessment> {
  const startTime = Date.now();

  // Run all 5 checks in parallel
  const checkPromises = [
    checkAmountAnomaly(input),
    checkVelocity(input),
    checkBeneficiary(input),
    checkCustomRules(input),
    checkPatternBaseline(input),
  ];

  const results = await Promise.allSettled(checkPromises);

  // Extract check results, providing fallback stubs for failures
  const checks: AICheck[] = [];

  // Amount anomaly check
  if (results[0].status === 'fulfilled') {
    checks.push(results[0].value);
  } else {
    checks.push({
      check_id: 'amount_anomaly',
      label: 'Amount Anomaly',
      passed: false,
      score: 0,
      detail: 'Check failed to complete',
      latency_ms: Date.now() - startTime,
    });
  }

  // Velocity check
  if (results[1].status === 'fulfilled') {
    checks.push(results[1].value);
  } else {
    checks.push({
      check_id: 'velocity',
      label: 'Velocity Check',
      passed: false,
      score: 0,
      detail: 'Check failed to complete',
      latency_ms: Date.now() - startTime,
    });
  }

  // Beneficiary check
  if (results[2].status === 'fulfilled') {
    checks.push(results[2].value);
  } else {
    checks.push({
      check_id: 'beneficiary',
      label: 'Beneficiary Risk',
      passed: false,
      score: 0.5,
      detail: 'Check failed to complete',
      latency_ms: Date.now() - startTime,
    });
  }

  // Custom rules check
  if (results[3].status === 'fulfilled') {
    checks.push(results[3].value);
  } else {
    checks.push({
      check_id: 'custom_rules',
      label: 'Custom Rules',
      passed: true,
      score: 1,
      detail: 'No custom rules configured',
      latency_ms: Date.now() - startTime,
    });
  }

  // Pattern baseline check
  if (results[4].status === 'fulfilled') {
    checks.push(results[4].value);
  } else {
    checks.push({
      check_id: 'pattern_baseline',
      label: 'Pattern Baseline',
      passed: true,
      score: 1,
      detail: 'Insufficient pattern history',
      latency_ms: Date.now() - startTime,
    });
  }

  // Check for hard blocks
  const hardBlockedCheck = checks.find((c) =>
    ['velocity', 'custom_rules'].includes(c.check_id) && !c.passed && c.score === 0
  );

  // Compute risk score and verdict
  const { risk_score, risk_level } = computeRiskScore(checks);
  const verdict = applyDecisionRules(
    risk_score,
    input.amount,
    input.ai_rules,
    !!hardBlockedCheck
  );

  // Build explanation
  const failedChecks = checks.filter((c) => !c.passed);
  const explanation = failedChecks.length > 0
    ? `${failedChecks.length} check(s) did not pass: ${failedChecks.map((c) => c.label).join(', ')}`
    : 'All checks passed';

  const assessment: RiskAssessment = {
    risk_score,
    risk_level,
    verdict,
    checks,
    explanation,
    requires_approval: verdict !== 'auto_approve',
    blocked_reason: hardBlockedCheck ? hardBlockedCheck.detail : undefined,
  };

  // Log to audit trail
  try {
    const supabase = await getSupabaseServiceRoleClient();
    await supabase.from('audit_events').insert({
      user_id: input.user_id,
      run_id: input.run_id,
      event_type: 'ai.assessment.completed',
      summary: explanation,
      metadata: {
        automation_type: input.automation_type,
        automation_id: input.automation_id,
        risk_score,
        verdict,
        checks_count: checks.length,
      },
      severity: verdict === 'blocked' ? 'warning' : 'info',
    });
  } catch (err) {
    console.warn('Audit log failed (non-fatal):', err);
  }

  return assessment;
}
