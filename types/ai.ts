export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type DecisionVerdict = 'auto_approve' | 'review_notify' | 'require_approval' | 'blocked';

export interface AICheck {
  check_id: string;
  label: string;
  passed: boolean;
  score: number;
  detail: string;
  latency_ms: number;
}

export interface RiskAssessment {
  risk_score: number;
  risk_level: RiskLevel;
  verdict: DecisionVerdict;
  checks: AICheck[];
  explanation: string;
  requires_approval: boolean;
  blocked_reason?: string;
  auto_approve_in_ms?: number;
}

export interface AIRules {
  auto_approve_below: number;
  require_approval_above: number;
  anomaly_score_threshold: number;
  max_amount: number;
  velocity_limit?: number;
  velocity_window_minutes?: number;
  custom_rules?: CustomRule[];
}

export interface CustomRule {
  field: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: number | string;
  action: 'block' | 'flag' | 'approve';
  label: string;
}

export interface PatternData {
  mean: number;
  std_dev: number;
  sample_count: number;
  last_updated: string;
}
