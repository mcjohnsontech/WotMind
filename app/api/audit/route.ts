import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const event_type = searchParams.get('event_type');
    const run_id = searchParams.get('run_id');

    const offset = (page - 1) * limit;

    let query = supabase
      .from('audit_events')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (event_type) {
      query = query.eq('event_type', event_type);
    }

    if (run_id) {
      query = query.eq('run_id', run_id);
    }

    const { data: events, count } = await query.range(offset, offset + limit - 1);

    return NextResponse.json({
      events: events || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
