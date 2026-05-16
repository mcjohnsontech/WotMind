import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(
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

    const { data: automation, error } = await supabase
      .from('automations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !automation) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
    }

    return NextResponse.json({ automation });
  } catch (error) {
    console.error('Failed to fetch automation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch automation' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const { name, config, ai_rules, notification_config, status } = body;

    const { data: automation, error } = await supabase
      .from('automations')
      .update({
        ...(name && { name }),
        ...(config && { config }),
        ...(ai_rules && { ai_rules }),
        ...(notification_config && { notification_config }),
        ...(status && { status }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ automation });
  } catch (error) {
    console.error('Failed to update automation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update automation' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { data: automation, error } = await supabase
      .from('automations')
      .update({ status: 'archived' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ automation });
  } catch (error) {
    console.error('Failed to delete automation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete automation' },
      { status: 500 }
    );
  }
}
