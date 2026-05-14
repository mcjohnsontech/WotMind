import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';

export interface AuditStepInput {
  run_id: string;
  user_id: string;
  status: 'completed' | 'failed' | 'blocked';
  summary: string;
}

export interface AuditStepOutput {
  message: string;
}

export async function executeAuditStep(
  input: AuditStepInput
): Promise<AuditStepOutput> {
  const { run_id, user_id, status, summary } = input;

  const supabase = await getSupabaseServiceRoleClient();

  // Final audit event
  const eventType =
    status === 'completed'
      ? 'workflow.run.completed'
      : status === 'failed'
        ? 'workflow.run.failed'
        : 'workflow.run.blocked';

  await supabase.from('audit_events').insert({
    run_id,
    user_id,
    event_type: eventType,
    metadata: {
      status,
      summary,
    },
    severity: status === 'completed' ? 'info' : 'warn',
  });

  return {
    message: `Workflow execution ${status}: ${summary}`,
  };
}
