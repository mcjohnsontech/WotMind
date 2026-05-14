import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { executeOcrStep } from './steps/ocr-step';
import { executeTrustStep } from './steps/trust-step';
import { executeTransferStep } from './steps/transfer-step';
import { executeAuditStep } from './steps/audit-step';
import { type RunStep } from '@/types/workflow';
import { type OcrResult } from '@/types/receipt';
import { type TrustReport } from '@/types/trust';

export interface RunContext {
  run_id: string;
  user_id: string;
  receipt_id?: string;
  ocr_result?: OcrResult;
  image_hash?: string;
  trust_report?: TrustReport;
  trust_verdict?: 'approved' | 'flagged' | 'blocked';
  transfer_result?: any;
}

export async function executeRun(
  runId: string,
  steps: RunStep[],
  triggerData: Record<string, any>
): Promise<RunContext> {
  const supabase = await getSupabaseServiceRoleClient();
  const ctx: RunContext = {
    run_id: runId,
    user_id: triggerData.user_id,
    receipt_id: triggerData.receipt_id,
    image_hash: triggerData.image_hash,
  };

  try {
    // Mark run as running
    await supabase
      .from('workflow_runs')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', runId);

    // Execute each step
    for (const step of steps) {
      const stepStartTime = Date.now();

      await supabase
        .from('run_steps')
        .update({
          status: 'running',
          started_at: new Date().toISOString(),
        })
        .eq('id', step.id);

      try {
        let output;

        if (step.step_type === 'ocr') {
          output = await executeOcrStep({
            receipt_id: ctx.receipt_id!,
            storage_path: triggerData.storage_path,
            file_data: triggerData.file_data,
          });
          ctx.ocr_result = output.ocr_result;
        } else if (step.step_type === 'trust') {
          output = await executeTrustStep({
            ocr_result: ctx.ocr_result!,
            image_hash: ctx.image_hash!,
            receipt_id: ctx.receipt_id!,
            user_id: ctx.user_id,
            run_id: runId,
          });
          ctx.trust_report = output.trust_report;
          ctx.trust_verdict = output.verdict;

          // If trust verdict is blocked, stop execution
          if (output.verdict === 'blocked') {
            const duration = Date.now() - stepStartTime;
            await supabase
              .from('run_steps')
              .update({
                status: 'completed',
                output_data: output,
                duration_ms: duration,
                completed_at: new Date().toISOString(),
              })
              .eq('id', step.id);

            // Mark run as blocked
            await supabase
              .from('workflow_runs')
              .update({
                status: 'blocked',
                completed_at: new Date().toISOString(),
              })
              .eq('id', runId);

            // Audit log
            await executeAuditStep({
              run_id: runId,
              user_id: ctx.user_id,
              status: 'blocked',
              summary: `Trust verification blocked: ${ctx.trust_report.blocked_reason}`,
            });

            return ctx;
          }
        } else if (step.step_type === 'transfer') {
          // Only transfer if trust approved
          if (ctx.trust_verdict === 'approved') {
            output = await executeTransferStep({
              run_id: runId,
              receipt_id: ctx.receipt_id!,
              amount: ctx.ocr_result?.amount || 0,
              user_id: ctx.user_id,
              beneficiary_account:
                process.env.DEMO_BENEFICIARY_ACCOUNT || '0123456789',
              beneficiary_bank: process.env.DEMO_BENEFICIARY_BANK || '058',
              beneficiary_name: process.env.DEMO_BENEFICIARY_NAME || 'Test',
              narration: `Fuel reimbursement - ${ctx.ocr_result?.vendor_name || 'Receipt'}`,
            });
            ctx.transfer_result = output.transfer;
          } else {
            // Skip transfer if not approved
            output = { message: 'Transfer skipped (trust not approved)' };
          }
        } else if (step.step_type === 'audit') {
          output = await executeAuditStep({
            run_id: runId,
            user_id: ctx.user_id,
            status: 'completed',
            summary: `Workflow completed successfully. Trust: ${ctx.trust_verdict}, Transfer: ${ctx.transfer_result ? 'initiated' : 'skipped'}`,
          });
        }

        const duration = Date.now() - stepStartTime;

        // Mark step as completed
        await supabase
          .from('run_steps')
          .update({
            status: 'completed',
            output_data: output || {},
            duration_ms: duration,
            completed_at: new Date().toISOString(),
          })
          .eq('id', step.id);
      } catch (error) {
        const duration = Date.now() - stepStartTime;
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error';

        // Mark step as failed
        await supabase
          .from('run_steps')
          .update({
            status: 'failed',
            error_message: errorMsg,
            duration_ms: duration,
            completed_at: new Date().toISOString(),
          })
          .eq('id', step.id);

        // Mark run as failed
        await supabase
          .from('workflow_runs')
          .update({
            status: 'failed',
            error_message: `${step.step_type} step failed: ${errorMsg}`,
            completed_at: new Date().toISOString(),
          })
          .eq('id', runId);

        // Audit log
        await supabase.from('audit_events').insert({
          run_id: runId,
          user_id: ctx.user_id,
          event_type: 'workflow.run.failed',
          metadata: { step: step.step_type, error: errorMsg },
          severity: 'error',
        });

        throw error;
      }
    }

    // Mark run as completed
    await supabase
      .from('workflow_runs')
      .update({
        status: 'completed',
        result_data: ctx,
        completed_at: new Date().toISOString(),
      })
      .eq('id', runId);

    return ctx;
  } catch (error) {
    // Ensure run is marked as failed even on unexpected errors
    await supabase
      .from('workflow_runs')
      .update({
        status: 'failed',
        error_message:
          error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString(),
      })
      .eq('id', runId);

    throw error;
  }
}
