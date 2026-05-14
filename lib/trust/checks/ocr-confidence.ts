import { type TrustCheckResult } from '@/types/trust';

export async function checkOcrConfidence(
  confidence: number
): Promise<TrustCheckResult> {
  const start = Date.now();

  const threshold = 0.75;
  const passed = confidence >= threshold;
  const latency = Date.now() - start;

  return {
    check_id: 'ocr_confidence',
    label: 'OCR Confidence',
    passed,
    score: confidence,
    weight: 0.15,
    detail: passed
      ? `OCR confidence ${(confidence * 100).toFixed(1)}% is high`
      : `OCR confidence ${(confidence * 100).toFixed(1)}% is below threshold (${(threshold * 100).toFixed(0)}%)`,
    latency_ms: latency,
  };
}
