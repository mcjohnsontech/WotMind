import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { runAIEngine } from '@/lib/ai/engine';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, automation_type, automation_id, custom_data } = body;

    // Fetch automation to get AI rules
    const { data: automation } = await supabase
      .from('automations')
      .select('ai_rules')
      .eq('id', automation_id)
      .single();

    const ai_rules = automation?.ai_rules || {
      auto_approve_below: 10000,
      require_approval_above: 100000,
      anomaly_score_threshold: 70,
      max_amount: 500000,
    };

    // Run AI assessment without creating a run record
    const assessment = await runAIEngine({
      amount,
      user_id: user.id,
      automation_type,
      automation_id,
      run_id: 'preview-' + Date.now(), // Fake run_id for preview
      custom_data,
      ai_rules,
    });

    return NextResponse.json({ assessment });
  } catch (error) {
    console.error('AI assessment failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Assessment failed' },
      { status: 500 }
    );
  }
}
