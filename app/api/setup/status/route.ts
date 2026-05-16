import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const REQUIRED_TABLES = [
  'profiles',
  'workflows',
  'automations',
  'automation_runs',
  'ai_patterns',
  'approval_tokens',
  'audit_events',
];

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const status: Record<string, boolean> = {};
    let ok = true;

    for (const t of REQUIRED_TABLES) {
      const { error } = await supabase.from(t).select('*', { count: 'exact', head: true }).limit(1);
      const present = !error || !/relation .* does not exist/i.test(error.message);
      status[t] = present;
      if (!present) ok = false;
    }

    return NextResponse.json({ ok, tables: status });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Failed' },
      { status: 200 }
    );
  }
}
