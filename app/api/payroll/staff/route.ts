import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient, getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import type { StaffMember } from '@/types/payroll';

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');

    let query = supabase
      .from('staff_members')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('name');

    if (department) {
      query = query.eq('department', department);
    }

    const { data: staff, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ staff: staff || [] });
  } catch (error) {
    console.error('Failed to fetch staff:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch staff' },
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
    const { bulk, items, ...single_staff } = body;

    const supabase_service = await getSupabaseServiceRoleClient();

    if (bulk && Array.isArray(items)) {
      // Bulk import
      const staff_to_insert = items.map((item: any) => ({
        user_id: user.id,
        name: item.name,
        email: item.email,
        phone_number: item.phone_number,
        account_number: item.account_number,
        bank_code: item.bank_code,
        bank_name: item.bank_name,
        base_salary: item.base_salary || 0,
        payment_type: item.payment_type || 'monthly',
        department: item.department,
      }));

      const { data: inserted, error } = await supabase_service
        .from('staff_members')
        .insert(staff_to_insert)
        .select();

      if (error) {
        throw error;
      }

      return NextResponse.json({ staff: inserted }, { status: 201 });
    } else {
      // Single staff member
      const { data: staff, error } = await supabase_service
        .from('staff_members')
        .insert({
          user_id: user.id,
          name: single_staff.name,
          email: single_staff.email,
          phone_number: single_staff.phone_number,
          account_number: single_staff.account_number,
          bank_code: single_staff.bank_code,
          bank_name: single_staff.bank_name,
          base_salary: single_staff.base_salary || 0,
          payment_type: single_staff.payment_type || 'monthly',
          department: single_staff.department,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json({ staff }, { status: 201 });
    }
  } catch (error) {
    console.error('Failed to create staff:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create staff' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    const supabase_service = await getSupabaseServiceRoleClient();

    const { data: staff, error } = await supabase_service
      .from('staff_members')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ staff });
  } catch (error) {
    console.error('Failed to update staff:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update staff' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    const supabase_service = await getSupabaseServiceRoleClient();

    const { data: staff, error } = await supabase_service
      .from('staff_members')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ staff });
  } catch (error) {
    console.error('Failed to delete staff:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete staff' },
      { status: 500 }
    );
  }
}
