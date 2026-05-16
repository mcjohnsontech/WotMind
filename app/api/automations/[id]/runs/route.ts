import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: runs, error } = await supabase
      .from('automation_runs')
      .select('*')
      .eq('automation_id', id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    return NextResponse.json({ runs: runs || [] });
  } catch (error) {
    console.error('Failed to fetch automation runs:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch runs',
      },
      { status: 500 }
    );
  }
}
