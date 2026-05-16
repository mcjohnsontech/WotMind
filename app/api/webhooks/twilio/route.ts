import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { dispatch } from '@/lib/notifications/dispatcher';

const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';

export async function POST(request: NextRequest) {
  try {
    // Validate Twilio signature
    const signature = request.headers.get('x-twilio-signature') || '';
    const bodyText = await request.text();
    const formData = new URLSearchParams(bodyText);

    // Convert URLSearchParams to object for validation
    const bodyObj: Record<string, any> = {};
    formData.forEach((value, key) => {
      bodyObj[key] = value;
    });

    const isValid = twilio.validateRequest(
      TWILIO_AUTH_TOKEN,
      signature,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio`,
      bodyObj as any
    );

    if (!isValid) {
      console.error('Invalid Twilio signature');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const message_body = formData.get('Body') || '';
    const from_number = formData.get('From') || '';

    // Parse approval/rejection from message
    // Expected format: YES-{TOKEN} or NO-{TOKEN}
    const match = message_body.match(/^(YES|NO)-([A-F0-9]+)$/i);

    if (!match) {
      // Not an approval message, ignore
      return NextResponse.json({ success: true });
    }

    const [, action, token] = match;
    const decision = action.toUpperCase() === 'YES' ? 'approved' : 'rejected';

    const supabase = await getSupabaseServiceRoleClient();

    // Find approval token
    const { data: token_record } = await supabase
      .from('approval_tokens')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .is('used_at', null)
      .maybeSingle();

    if (!token_record) {
      // Token not found or expired
      await dispatch({
        channel: 'sms',
        recipient: from_number,
        message_type: 'alert',
        message_content: 'WOTMIND: Invalid or expired approval token. Please try again or check your automation.',
        user_id: '00000000-0000-0000-0000-000000000000',
      }).catch(() => {});

      return NextResponse.json({ success: true });
    }

    const userId = token_record.user_id as string;

    // Mark token as used
    await supabase
      .from('approval_tokens')
      .update({
        used_at: new Date().toISOString(),
        decision,
      })
      .eq('id', token_record.id);

    // Update automation run
    if (decision === 'approved') {
      await supabase
        .from('automation_runs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          approval_responded_at: new Date().toISOString(),
          approved_by: from_number,
          result_data: { message: 'Approved via SMS reply' },
        })
        .eq('id', token_record.run_id);

      // Send confirmation
      await dispatch({
        channel: 'sms',
        recipient: from_number,
        message_type: 'payment_confirmation',
        message_content: `WOTMIND: ✓ Transaction approved and executed. Check audit log for details.`,
        user_id: userId,
        run_id: token_record.run_id,
      }).catch(() => {});
    } else {
      await supabase
        .from('automation_runs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          approval_responded_at: new Date().toISOString(),
          approved_by: from_number,
          error_message: 'Rejected via SMS reply',
        })
        .eq('id', token_record.run_id);

      // Send rejection confirmation
      await dispatch({
        channel: 'sms',
        recipient: from_number,
        message_type: 'alert',
        message_content: `WOTMIND: Transaction rejected. No amount was transferred.`,
        user_id: userId,
        run_id: token_record.run_id,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Twilio webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
