import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient, getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { runAIEngine } from '@/lib/ai/engine';
import { dispatch } from '@/lib/notifications/dispatcher';
import { updatePatterns } from '@/lib/ai/pattern-learner';
import crypto from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const serviceSupabase = await getSupabaseServiceRoleClient();

    // Fetch automation
    const { data: automation, error: auto_error } = await serviceSupabase
      .from('automations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (auto_error || !automation) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
    }

    // Create automation run record
    const { data: run, error: run_error } = await serviceSupabase
      .from('automation_runs')
      .insert({
        automation_id: automation.id,
        user_id: user.id,
        automation_type: automation.automation_type,
        status: 'pending',
        input_data: body.input_data || {},
      })
      .select()
      .single();

    if (run_error || !run) {
      throw run_error || new Error('Failed to create run');
    }

    // Run AI assessment
    const ai_result = await runAIEngine({
      amount: body.input_data?.amount || 0,
      user_id: user.id,
      automation_type: automation.automation_type,
      automation_id: automation.id,
      run_id: run.id,
      beneficiary_id: body.input_data?.beneficiary_id,
      custom_data: body.input_data,
      ai_rules: automation.ai_rules,
    });

    // Update run with AI assessment
    await serviceSupabase
      .from('automation_runs')
      .update({
        status: 'running',
        ai_assessment: ai_result,
      })
      .eq('id', run.id);

    // Execute based on verdict
    const verdict = ai_result.verdict;

    if (verdict === 'blocked') {
      await serviceSupabase
        .from('automation_runs')
        .update({
          status: 'blocked',
          error_message: ai_result.blocked_reason || 'Blocked by AI checks',
        })
        .eq('id', run.id);

      // Notify user of block
      await dispatch({
        channel: 'sms',
        recipient: automation.notification_config?.approval_phone || user.id,
        message_type: 'alert',
        message_content: `WOTMIND: Transaction blocked. Reason: ${ai_result.blocked_reason}`,
        user_id: user.id,
        run_id: run.id,
      }).catch(() => {});

      return NextResponse.json({
        run_id: run.id,
        status: 'blocked',
        verdict: 'blocked',
        requires_approval: false,
      });
    }

    if (verdict === 'auto_approve') {
      // Execute immediately
      await executeAutomation(run.id, user.id, automation, body.input_data);

      return NextResponse.json({
        run_id: run.id,
        status: 'executing',
        verdict: 'auto_approve',
        requires_approval: false,
      });
    }

    if (verdict === 'review_notify' || verdict === 'require_approval') {
      // Generate approval token
      const token = crypto.randomBytes(3).toString('hex').toUpperCase();
      const expires_at = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await serviceSupabase
        .from('approval_tokens')
        .insert({
          user_id: user.id,
          run_id: run.id,
          token,
          context: {
            phone_number: automation.notification_config?.approval_phone || '',
            amount: body.input_data?.amount || 0,
            automation_id: automation.id,
            verdict,
          },
          expires_at: expires_at.toISOString(),
        });

      // Send approval request
      await dispatch({
        channel: 'sms',
        recipient: automation.notification_config?.approval_phone || user.id,
        message_type: 'approval_request',
        message_content: `WOTMIND: Approve ₦${(body.input_data?.amount || 0).toLocaleString()}? Reply YES-${token} to approve.`,
        user_id: user.id,
        run_id: run.id,
      }).catch(() => {});

      // Mark as awaiting approval
      await serviceSupabase
        .from('automation_runs')
        .update({
          status: 'awaiting_approval',
          approval_requested_at: new Date().toISOString(),
        })
        .eq('id', run.id);

      return NextResponse.json({
        run_id: run.id,
        status: 'awaiting_approval',
        verdict,
        requires_approval: true,
        auto_approve_in_ms: verdict === 'review_notify' ? 30 * 60 * 1000 : undefined,
      });
    }

    throw new Error(`Unknown verdict: ${verdict}`);
  } catch (error) {
    console.error('Automation execution failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Execution failed' },
      { status: 500 }
    );
  }
}

async function executeAutomation(
  run_id: string,
  user_id: string,
  automation: any,
  input_data: any
): Promise<void> {
  const supabase = await getSupabaseServiceRoleClient();

  try {
    // Placeholder: actual automation execution would dispatch based on automation_type
    // For now, just mark as completed

    await supabase
      .from('automation_runs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        result_data: { message: 'Execution pending - full implementation needed' },
      })
      .eq('id', run_id);

    // Learn from this execution
    if (input_data?.amount) {
      await updatePatterns(user_id, automation.automation_type, input_data.amount, true);
    }
  } catch (error) {
    console.error('Automation execution error:', error);
    throw error;
  }
}
