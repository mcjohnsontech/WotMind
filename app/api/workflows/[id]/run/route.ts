import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { startWorkflowRun } from '@/lib/workflow/runner';

type Params = Promise<{ id: string }>;

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id: workflow_id } = await params;
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const result = await startWorkflowRun({
      workflow_id,
      user_id: user.id,
      trigger_data: {
        ...body,
        user_id: user.id,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error starting workflow:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start workflow' },
      { status: 500 }
    );
  }
}
