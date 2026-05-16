import { type OcrResult } from '@/types/receipt';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import {
  type AIProvider,
  type OCRRequest,
  type ProviderId,
  ProviderError,
} from './types';
import { geminiProvider } from './gemini';
import { openRouterProvider } from './openrouter';
import {
  DEFAULT_FALLBACK_CHAIN,
  DEFAULT_MODEL,
  findModel,
} from './registry';

const PROVIDERS: Record<ProviderId, AIProvider> = {
  gemini: geminiProvider,
  openrouter: openRouterProvider,
};

interface ChainEntry {
  provider: ProviderId;
  model: string;
}

interface UserAISettings {
  preferred_provider: ProviderId;
  preferred_model: string;
  fallback_chain: ChainEntry[];
  monthly_token_budget: number | null;
  tokens_used_this_month: number;
  usage_reset_at: string;
}

async function getUserSettings(userId: string): Promise<UserAISettings> {
  const supabase = await getSupabaseServiceRoleClient();
  const { data } = await supabase
    .from('user_ai_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (!data) {
    return {
      preferred_provider: DEFAULT_MODEL.provider,
      preferred_model: DEFAULT_MODEL.id,
      fallback_chain: DEFAULT_FALLBACK_CHAIN,
      monthly_token_budget: null,
      tokens_used_this_month: 0,
      usage_reset_at: new Date().toISOString(),
    };
  }

  return {
    preferred_provider: data.preferred_provider,
    preferred_model: data.preferred_model,
    fallback_chain: Array.isArray(data.fallback_chain) ? data.fallback_chain : DEFAULT_FALLBACK_CHAIN,
    monthly_token_budget: data.monthly_token_budget,
    tokens_used_this_month: data.tokens_used_this_month ?? 0,
    usage_reset_at: data.usage_reset_at,
  };
}

async function recordUsage(userId: string, tokens: number, provider: ProviderId, modelId: string) {
  if (tokens <= 0) return;
  const supabase = await getSupabaseServiceRoleClient();
  await supabase.rpc('increment_ai_usage', {
    p_user_id: userId,
    p_tokens: tokens,
    p_provider: provider,
    p_model: modelId,
  });
}

function isExhausted(settings: UserAISettings): boolean {
  if (settings.monthly_token_budget == null) return false;
  return settings.tokens_used_this_month >= settings.monthly_token_budget;
}

function buildChain(settings: UserAISettings): ChainEntry[] {
  const chain: ChainEntry[] = [];
  if (!isExhausted(settings)) {
    chain.push({ provider: settings.preferred_provider, model: settings.preferred_model });
  }
  for (const entry of settings.fallback_chain) {
    if (!chain.some((c) => c.provider === entry.provider && c.model === entry.model)) {
      chain.push(entry);
    }
  }
  return chain;
}

export interface ExtractResult {
  ocr: OcrResult;
  provider: ProviderId;
  model: string;
  fallbackUsed: boolean;
  attempts: { provider: ProviderId; model: string; error?: string }[];
}

export async function extractReceiptForUser(
  userId: string,
  req: OCRRequest
): Promise<ExtractResult> {
  const settings = await getUserSettings(userId);
  const chain = buildChain(settings);

  if (chain.length === 0) {
    throw new ProviderError({
      message: 'No providers available',
      category: 'unavailable',
      provider: 'gemini',
    });
  }

  const attempts: ExtractResult['attempts'] = [];

  for (let i = 0; i < chain.length; i++) {
    const { provider, model } = chain[i];
    const adapter = PROVIDERS[provider];
    if (!adapter) {
      attempts.push({ provider, model, error: 'provider not registered' });
      continue;
    }

    // Skip non-vision models for OCR — registry knows which ones support vision
    const meta = findModel(provider, model);
    if (meta && !meta.vision) {
      attempts.push({ provider, model, error: 'model lacks vision capability' });
      continue;
    }

    try {
      const response = await adapter.extractReceiptData(req, model);
      attempts.push({ provider, model });

      if (response.usage?.total_tokens) {
        await recordUsage(userId, response.usage.total_tokens, provider, model).catch((err) => {
          console.error('Failed to record AI usage:', err);
        });
      }

      return {
        ocr: response.result,
        provider,
        model,
        fallbackUsed: i > 0,
        attempts,
      };
    } catch (err) {
      const pe = err instanceof ProviderError ? err : null;
      const errMsg = pe ? `${pe.category}: ${pe.message}` : (err instanceof Error ? err.message : String(err));
      attempts.push({ provider, model, error: errMsg });

      // Stop the chain only for unrecoverable input errors — those will fail
      // on every provider with the same input.
      if (pe?.category === 'invalid_input') {
        throw pe;
      }
      // Otherwise (quota/rate/auth/unavailable/unknown) continue down the chain
    }
  }

  throw new ProviderError({
    message: `All providers exhausted. Attempts: ${attempts.map((a) => `${a.provider}/${a.model} (${a.error})`).join('; ')}`,
    category: 'unavailable',
    provider: chain[chain.length - 1].provider,
  });
}
