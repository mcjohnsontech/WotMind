import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: workflows, count } = await supabase
      .from('workflows')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      workflows: workflows || [],
      total: count || 0,
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
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
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Workflow name is required' },
        { status: 400 }
      );
    }

    // Default demo pipeline nodes
    const nodes = [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { label: 'Receipt Upload' },
      },
      {
        id: 'ocr-1',
        type: 'ocr',
        position: { x: 400, y: 100 },
        data: { label: 'OCR Extraction' },
      },
      {
        id: 'trust-1',
        type: 'trust',
        position: { x: 700, y: 100 },
        data: { label: 'Trust Verification' },
      },
      {
        id: 'transfer-1',
        type: 'transfer',
        position: { x: 1000, y: 100 },
        data: { label: 'Squad Transfer' },
      },
      {
        id: 'audit-1',
        type: 'audit',
        position: { x: 1300, y: 100 },
        data: { label: 'Audit Log' },
      },
    ];

    const edges = [
      { id: 'e1', source: 'trigger-1', target: 'ocr-1', animated: true },
      { id: 'e2', source: 'ocr-1', target: 'trust-1', animated: true },
      { id: 'e3', source: 'trust-1', target: 'transfer-1', animated: true },
      { id: 'e4', source: 'transfer-1', target: 'audit-1', animated: true },
    ];

    const serviceSupabase = await getSupabaseServiceRoleClient();
    const { data: workflow } = await serviceSupabase
      .from('workflows')
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        status: 'active',
        nodes,
        edges,
      })
      .select()
      .single();

    return NextResponse.json({ workflow });
  } catch (error) {
    console.error('Error creating workflow:', error);
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    );
  }
}
