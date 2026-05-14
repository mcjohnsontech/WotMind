import { type OcrResult } from './receipt';

export type TrustVerdict = 'approved' | 'flagged' | 'blocked';
export type CheckId =
  | 'duplicate_check'
  | 'vendor_check'
  | 'amount_anomaly'
  | 'ocr_confidence'
  | 'velocity_check';

export interface TrustCheckResult {
  check_id: CheckId;
  label: string;
  passed: boolean;
  score: number;
  weight: number;
  detail: string;
  latency_ms: number;
}

export interface TrustReport {
  overall_score: number;
  verdict: TrustVerdict;
  check_results: TrustCheckResult[];
  explanation: string;
  blocked_reason?: string;
}

export interface TrustEngineInput {
  receipt: OcrResult;
  image_hash: string;
  user_id: string;
  run_id: string;
}
