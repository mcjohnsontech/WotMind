import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient, getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { initiateTransfer } from '@/lib/squad/client';
import { dispatch } from '@/lib/notifications/dispatcher';
import { buildPayrollReceiptSMS } from '@/lib/notifications/templates';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { automation_id, staff_ids, custom_amounts } = body;

    const supabase_service = await getSupabaseServiceRoleClient();

    // Fetch automation
    const { data: automation } = await supabase_service
      .from('automations')
      .select('*')
      .eq('id', automation_id)
      .eq('user_id', user.id)
      .single();

    if (!automation) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
    }

    // Fetch staff members
    let query = supabase_service
      .from('staff_members')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (staff_ids && staff_ids.length > 0) {
      query = query.in('id', staff_ids);
    }

    const { data: staff_list } = await query;

    if (!staff_list || staff_list.length === 0) {
      return NextResponse.json({ error: 'No staff selected' }, { status: 400 });
    }

    // Create payroll run record
    const total_amount = staff_list.reduce((sum, s) => {
      const amount = custom_amounts?.[s.id] || s.base_salary || 0;
      return sum + amount;
    }, 0);

    const { data: payroll_run } = await supabase_service
      .from('automation_runs')
      .insert({
        automation_id: automation.id,
        user_id: user.id,
        automation_type: 'payroll',
        status: 'running',
        input_data: { staff_count: staff_list.length, total_amount },
      })
      .select()
      .single();

    if (!payroll_run) {
      throw new Error('Failed to create payroll run');
    }

    // Execute transfers sequentially
    let completed_count = 0;
    let failed_count = 0;
    const transfer_results: any[] = [];

    for (const staff of staff_list) {
      try {
        const amount = custom_amounts?.[staff.id] || staff.base_salary || 0;

        const transfer = await initiateTransfer({
          run_id: payroll_run.id,
          amount,
          currency: 'NGN',
          beneficiary_account: staff.account_number,
          beneficiary_bank: staff.bank_code,
          beneficiary_name: staff.name,
          narration: `Salary for ${staff.name}`,
        });

        transfer_results.push({ staff_id: staff.id, ...transfer });
        completed_count++;

        // Send SMS receipt to staff
        if (staff.phone_number) {
          await dispatch({
            channel: 'sms',
            recipient: staff.phone_number,
            message_type: 'receipt',
            message_content: buildPayrollReceiptSMS(staff.name, amount),
            run_id: payroll_run.id,
            user_id: user.id,
          }).catch((err) => console.error('Failed to send staff SMS:', err));
        }
      } catch (error) {
        failed_count++;
        transfer_results.push({
          staff_id: staff.id,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Transfer failed',
        });
      }
    }

    // Update payroll run
    await supabase_service
      .from('automation_runs')
      .update({
        status: completed_count > 0 ? 'completed' : 'failed',
        completed_at: new Date().toISOString(),
        result_data: {
          completed_count,
          failed_count,
          total_count: staff_list.length,
          total_amount,
          transfers: transfer_results,
        },
      })
      .eq('id', payroll_run.id);

    // Send summary SMS to manager
    const approval_phone = automation.notification_config?.approval_phone;
    if (approval_phone) {
      await dispatch({
        channel: 'sms',
        recipient: approval_phone,
        message_type: 'payment_confirmation',
        message_content: `WOTMIND: Payroll executed. ${completed_count}/${staff_list.length} staff paid. Total: ₦${total_amount.toLocaleString('en-NG')}`,
        run_id: payroll_run.id,
        user_id: user.id,
      }).catch(() => {});
    }

    return NextResponse.json({
      payroll_run_id: payroll_run.id,
      completed_count,
      failed_count,
      total_amount,
      transfers: transfer_results,
    });
  } catch (error) {
    console.error('Payroll execution failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payroll execution failed' },
      { status: 500 }
    );
  }
}
