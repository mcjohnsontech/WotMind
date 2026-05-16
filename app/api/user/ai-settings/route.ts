import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  DEFAULT_FALLBACK_CHAIN,
  DEFAULT_MODEL,
  findModel,
} from '@/lib/ai-providers/registry';
import { type ProviderId } from '@/lib/ai-providers/types';

const PROVIDER_IDS = ['gemini', 'openrouter'] as const;

const ChainEntrySchema = z.object({
  provider: z.enum(PROVIDER_IDS),
  model: z.string().min(1),
});

const UpdateSchema = z.object({
  preferred_provider: z.enum(PROVIDER_IDS).optional(),
  preferred_model: z.string().min(1).optional(),
  fallback_chain: z.array(ChainEntrySchema).max(5).optional(),
  monthly_token_budget: z.number().int().nonnegative().nullable().optional(),
});

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('user_ai_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!data) {
    return NextResponse.json({
      settings: {
        preferred_provider: DEFAULT_MODEL.provider,
        preferred_model: DEFAULT_MODEL.id,
        fallback_chain: DEFAULT_FALLBACK_CHAIN,
        monthly_token_budget: null,
        tokens_used_this_month: 0,
        usage_reset_at: null,
      },
    });
  }

  return NextResponse.json({ settings: data });
}

export async function PUT(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.issues }, { status: 400 });
  }
  const updates = parsed.data;

  // Validate that any selected model exists in our catalog and is vision-capable
  if (updates.preferred_provider && updates.preferred_model) {
    const model = findModel(updates.preferred_provider as ProviderId, updates.preferred_model);
    if (!model) {
      return NextResponse.json({ error: 'Unknown model' }, { status: 400 });
    }
    if (!model.vision) {
      return NextResponse.json({ error: 'Selected model does not support vision (required for OCR)' }, { status: 400 });
    }
  }

  if (updates.fallback_chain) {
    for (const entry of updates.fallback_chain) {
      const model = findModel(entry.provider as ProviderId, entry.model);
      if (!model) {
        return NextResponse.json(
          { error: `Unknown model in fallback chain: ${entry.provider}/${entry.model}` },
          { status: 400 }
        );
      }
    }
  }

  const { data, error } = await supabase
    .from('user_ai_settings')
    .upsert(
      {
        user_id: user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ settings: data });
}
