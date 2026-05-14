import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { executeRun } from './executor';
import { type StepType } from '@/types/workflow';

export interface RunnerInput {
  workflow_id: string;
  user_id: string;
  trigger_data: Record<string, any>;
}

export async function startWorkflowRun(input: RunnerInput) {
  const { workflow_id, user_id, trigger_data } = input;
  const supabase = await getSupabaseServiceRoleClient();

  // Create workflow run record
  const { data: run } = await supabase
    .from('workflow_runs')
    .insert({
      workflow_id,
      user_id,
      status: 'pending',
      trigger_data,
    })
    .select()
    .single();

  if (!run) {
    throw new Error('Failed to create workflow run');
  }

  // Create run step records for the demo pipeline
  const stepTypes: StepType[] = ['ocr', 'trust', 'transfer', 'audit'];

  const { data: steps } = await supabase
    .from('run_steps')
    .insert(
      stepTypes.map((stepType, index) => ({
        run_id: run.id,
        step_type: stepType,
        step_index: index,
        status: 'pending',
      }))
    )
    .select();

  if (!steps) {
    throw new Error('Failed to create run steps');
  }

  // Start execution asynchronously (don't await)
  executeRun(run.id, steps, trigger_data).catch((error) => {
    console.error('Workflow execution error:', error);
  });

  // Log audit event
  await supabase.from('audit_events').insert({
    run_id: run.id,
    user_id,
    event_type: 'workflow.run.started',
    metadata: { workflow_id },
    severity: 'info',
  });

  return {
    run_id: run.id,
    status: run.status,
  };
}
