import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { initiateTransfer } from '@/lib/squad/client';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      run_id,
      receipt_id,
      amount,
      beneficiary_account,
      beneficiary_bank,
      beneficiary_name,
      narration,
    } = body;

    if (!amount || !beneficiary_account || !beneficiary_name) {
      return NextResponse.json(
        { error: 'Missing required transfer fields' },
        { status: 400 }
      );
    }

    // Verify trust verdict from DB if run_id provided
    if (run_id) {
      const serviceSupabase = await getSupabaseServiceRoleClient();
      const { data: trustReports } = await serviceSupabase
        .from('trust_reports')
        .select('verdict')
        .eq('run_id', run_id)
        .single();

      if (trustReports?.verdict === 'blocked') {
        return NextResponse.json(
          { error: 'Transfer blocked: Trust verification failed' },
          { status: 403 }
        );
      }
    }

    // Initiate transfer
    const squadResult = await initiateTransfer({
      run_id,
      receipt_id,
      amount,
      currency: 'NGN',
      beneficiary_account,
      beneficiary_bank: beneficiary_bank || '058',
      beneficiary_name,
      narration,
      trust_score: 0.8,
    });

    // Save transfer record
    const serviceSupabase = await getSupabaseServiceRoleClient();
    const { data: savedTransfer } = await serviceSupabase
      .from('transfers')
      .insert({
        run_id: run_id || null,
        user_id: user.id,
        receipt_id,
        squad_reference: squadResult.squad_reference,
        amount,
        currency: 'NGN',
        beneficiary_account,
        beneficiary_bank: beneficiary_bank || '058',
        beneficiary_name,
        narration,
        status: squadResult.status,
        squad_response: squadResult.response_data,
        initiated_at: new Date().toISOString(),
      })
      .select()
      .single();

    return NextResponse.json({
      transfer: {
        transfer_id: savedTransfer?.id,
        squad_reference: squadResult.squad_reference,
        status: squadResult.status,
        amount,
        currency: 'NGN',
      },
    });
  } catch (error) {
    console.error('Transfer error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Transfer failed' },
      { status: 500 }
    );
  }
}
