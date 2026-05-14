import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { runTrustEngine } from '@/lib/trust/engine';
import { type OcrResult } from '@/types/receipt';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { receipt_id, ocr_result, image_hash, run_id } = body;

    if (!receipt_id || !ocr_result || !image_hash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Run trust engine
    const trustReport = await runTrustEngine({
      receipt: ocr_result as OcrResult,
      image_hash,
      user_id: user.id,
      run_id: run_id || '',
    });

    // Save trust report
    const serviceSupabase = await getSupabaseServiceRoleClient();
    const { data: savedReport } = await serviceSupabase
      .from('trust_reports')
      .insert({
        run_id: run_id || null,
        receipt_id,
        overall_score: trustReport.overall_score,
        verdict: trustReport.verdict,
        check_results: trustReport.check_results,
        explanation: trustReport.explanation,
      })
      .select()
      .single();

    return NextResponse.json({
      trust_report: trustReport,
      trust_report_id: savedReport?.id,
    });
  } catch (error) {
    console.error('Trust engine error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Trust verification failed' },
      { status: 500 }
    );
  }
}
