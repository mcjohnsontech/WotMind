import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { dispatch } from '@/lib/notifications/dispatcher';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = await getSupabaseServiceRoleClient();

    const { data: token_record } = await supabase
      .from('approval_tokens')
      .select('*, automation_runs(*)')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (!token_record) {
      return new NextResponse(
        `<html><body style="font-family:system-ui;background:#0a0a0b;color:#f0f0f2;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0"><div style="text-align:center;padding:24px"><h1>Invalid or expired link</h1><p style="color:#8e8e96">This approval link is no longer valid.</p></div></body></html>`,
        { status: 404, headers: { 'Content-Type': 'text/html' } }
      );
    }

    const run = token_record.automation_runs as any;
    const amount = run?.input_data?.amount ?? token_record.context?.amount ?? 0;

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Approve Transaction · Wotmind</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0b; color: #f0f0f2; padding: 20px; text-align: center; margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .container { max-width: 420px; width: 100%; background: #111113; border: 1px solid #2a2a30; border-radius: 16px; padding: 32px; box-shadow: 0 8px 32px rgba(0,0,0,.6); }
    h1 { color: #ff6d5a; margin: 0 0 8px 0; font-size: 22px; }
    .sub { color: #8e8e96; margin: 0 0 24px 0; font-size: 13px; }
    .amount { font-size: 36px; font-weight: 800; color: #f5a623; margin: 16px 0; letter-spacing: -1px; }
    .buttons { display: flex; gap: 10px; margin-top: 24px; }
    button { flex: 1; padding: 14px; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.15s; color: white; }
    .approve { background: #2dd4a8; }
    .approve:hover { background: #24b993; transform: translateY(-1px); }
    .reject { background: #ef4444; }
    .reject:hover { background: #dc2626; transform: translateY(-1px); }
    .info { color: #5e5e66; font-size: 11px; margin-top: 20px; }
    .badge { display:inline-flex; align-items:center; gap:6px; padding:4px 10px; background:#ff6d5a1a; color:#ff6d5a; border:1px solid #ff6d5a33; border-radius:999px; font-size:11px; font-weight:600; margin-bottom:12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">⚡ Approval required</div>
    <h1>Approve this transaction?</h1>
    <p class="sub">Wotmind is requesting your approval to proceed.</p>
    <div class="amount">₦${Number(amount).toLocaleString('en-NG')}</div>
    <div class="buttons">
      <form action="/api/approvals/${token}" method="POST" style="flex: 1;">
        <input type="hidden" name="decision" value="approved">
        <button class="approve" type="submit">Approve</button>
      </form>
      <form action="/api/approvals/${token}" method="POST" style="flex: 1;">
        <input type="hidden" name="decision" value="rejected">
        <button class="reject" type="submit">Reject</button>
      </form>
    </div>
    <p class="info">This link expires in 1 hour.</p>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Approval page error:', error);
    return new NextResponse(
      `<html><body><h1>Error loading approval page</h1></body></html>`,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const formData = await request.formData();
    const decision = formData.get('decision') as string;

    const supabase = await getSupabaseServiceRoleClient();

    const { data: token_record } = await supabase
      .from('approval_tokens')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (!token_record) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    if (token_record.used_at) {
      return NextResponse.json({ error: 'Token already used' }, { status: 400 });
    }

    const phone = (token_record.context as any)?.phone_number || '';
    const userId = token_record.user_id as string;

    await supabase
      .from('approval_tokens')
      .update({
        used_at: new Date().toISOString(),
        decision: decision === 'approved' ? 'approved' : 'rejected',
      })
      .eq('id', token_record.id);

    if (decision === 'approved') {
      await supabase
        .from('automation_runs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          approval_responded_at: new Date().toISOString(),
          approved_by: phone || 'whatsapp',
          result_data: { message: 'Approved via WhatsApp link' },
        })
        .eq('id', token_record.run_id);

      if (phone) {
        await dispatch({
          channel: 'whatsapp',
          recipient: phone,
          message_type: 'payment_confirmation',
          message_content: `WOTMIND: Transaction approved and executed.`,
          user_id: userId,
          run_id: token_record.run_id,
        }).catch(() => {});
      }

      return new NextResponse(
        `<html><body style="font-family:system-ui;background:#0a0a0b;color:#f0f0f2;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0"><div style="text-align:center;padding:24px"><h1 style="color:#2dd4a8">✓ Approved</h1><p style="color:#8e8e96">The transaction will now execute.</p></div></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    } else {
      await supabase
        .from('automation_runs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          approval_responded_at: new Date().toISOString(),
          approved_by: phone || 'whatsapp',
          error_message: 'Rejected by user',
        })
        .eq('id', token_record.run_id);

      if (phone) {
        await dispatch({
          channel: 'whatsapp',
          recipient: phone,
          message_type: 'alert',
          message_content: `WOTMIND: Transaction rejected. No amount was transferred.`,
          user_id: userId,
          run_id: token_record.run_id,
        }).catch(() => {});
      }

      return new NextResponse(
        `<html><body style="font-family:system-ui;background:#0a0a0b;color:#f0f0f2;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0"><div style="text-align:center;padding:24px"><h1 style="color:#ef4444">✕ Rejected</h1><p style="color:#8e8e96">No action was taken.</p></div></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
  } catch (error) {
    console.error('Approval processing failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Approval failed' },
      { status: 500 }
    );
  }
}
