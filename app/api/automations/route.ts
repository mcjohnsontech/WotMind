import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: automations, error } = await supabase
      .from('automations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ automations: automations || [] });
  } catch (error) {
    console.error('Failed to fetch automations:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch automations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, automation_type, config, ai_rules, notification_config } = body;

    if (!name || !automation_type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, automation_type' },
        { status: 400 }
      );
    }

    const { data: automation, error } = await supabase
      .from('automations')
      .insert({
        user_id: user.id,
        name,
        automation_type,
        config: config || {},
        ai_rules: ai_rules || {
          auto_approve_below: 10000,
          require_approval_above: 100000,
          anomaly_score_threshold: 70,
          max_amount: 500000,
        },
        notification_config: notification_config || {
          approval_phone: '',
          notify_on_complete: '',
          channels: ['sms'],
          whatsapp_enabled: false,
        },
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ automation }, { status: 201 });
  } catch (error) {
    console.error('Failed to create automation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create automation' },
      { status: 500 }
    );
  }
}
