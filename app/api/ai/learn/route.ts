import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient, getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { updatePatterns } from '@/lib/ai/pattern-learner';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { run_id, decision } = body;

    if (!run_id || !decision) {
      return NextResponse.json(
        { error: 'Missing required fields: run_id, decision' },
        { status: 400 }
      );
    }

    const serviceSupabase = await getSupabaseServiceRoleClient();

    // Fetch run to get automation details
    const { data: run } = await serviceSupabase
      .from('automation_runs')
      .select('*')
      .eq('id', run_id)
      .eq('user_id', user.id)
      .single();

    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }

    const amount = run.input_data?.amount;
    const approved = decision === 'approved';

    if (amount) {
      // Update patterns based on human decision
      await updatePatterns(user.id, run.automation_type, amount, approved);
    }

    return NextResponse.json({
      success: true,
      message: 'Pattern updated',
    });
  } catch (error) {
    console.error('Pattern learning failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Learning failed' },
      { status: 500 }
    );
  }
}
