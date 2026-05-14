import { runTrustEngine } from '@/lib/trust/engine';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { type TrustReport } from '@/types/trust';
import { type OcrResult } from '@/types/receipt';

export interface TrustStepInput {
  ocr_result: OcrResult;
  image_hash: string;
  receipt_id: string;
  user_id: string;
  run_id: string;
}

export interface TrustStepOutput {
  trust_report: TrustReport;
  verdict: 'approved' | 'flagged' | 'blocked';
}

export async function executeTrustStep(
  input: TrustStepInput
): Promise<TrustStepOutput> {
  const { ocr_result, image_hash, receipt_id, user_id, run_id } = input;

  // Run trust engine
  const trustReport = await runTrustEngine({
    receipt: ocr_result,
    image_hash,
    user_id,
    run_id,
  });

  // Save trust report
  const supabase = await getSupabaseServiceRoleClient();
  const { data: savedReport } = await supabase
    .from('trust_reports')
    .insert({
      run_id,
      receipt_id,
      overall_score: trustReport.overall_score,
      verdict: trustReport.verdict,
      check_results: trustReport.check_results,
      explanation: trustReport.explanation,
    })
    .select()
    .single();

  // Log audit events based on verdict
  const eventType =
    trustReport.verdict === 'approved'
      ? 'trust.approved'
      : trustReport.verdict === 'flagged'
        ? 'trust.flagged'
        : 'trust.blocked';

  await supabase.from('audit_events').insert({
    run_id,
    event_type: eventType,
    entity_type: 'trust_report',
    entity_id: savedReport?.id,
    metadata: {
      score: trustReport.overall_score,
      verdict: trustReport.verdict,
      checks: trustReport.check_results.map((c) => ({
        id: c.check_id,
        passed: c.passed,
        score: c.score,
      })),
    },
    severity:
      trustReport.verdict === 'blocked'
        ? 'critical'
        : trustReport.verdict === 'flagged'
          ? 'warn'
          : 'info',
  });

  return {
    trust_report: trustReport,
    verdict: trustReport.verdict,
  };
}
