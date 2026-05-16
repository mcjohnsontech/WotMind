import { type ProviderId } from './types';

export interface ModelEntry {
  provider: ProviderId;
  id: string;
  label: string;
  description: string;
  tier: 'free' | 'cheap' | 'premium';
  vision: boolean;
  contextLength: number;
}

/**
 * Curated catalog of models we expose to users. OpenRouter exposes hundreds —
 * we only surface the ones that make sense for receipt OCR + reasoning.
 * The dynamic /api/v1/models endpoint can be merged in later for power users.
 */
export const MODEL_CATALOG: ModelEntry[] = [
  {
    provider: 'gemini',
    id: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    description: 'Default. Fast, accurate, generous free tier from Google.',
    tier: 'free',
    vision: true,
    contextLength: 1_000_000,
  },
  {
    provider: 'gemini',
    id: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    description: 'Most capable Gemini model. Slower, higher cost.',
    tier: 'premium',
    vision: true,
    contextLength: 2_000_000,
  },
  {
    provider: 'openrouter',
    id: 'meta-llama/llama-3.2-90b-vision-instruct',
    label: 'Llama 3.2 90B Vision',
    description: 'Open-source vision model. Strong receipt OCR.',
    tier: 'cheap',
    vision: true,
    contextLength: 131_072,
  },
  {
    provider: 'openrouter',
    id: 'meta-llama/llama-3.2-11b-vision-instruct',
    label: 'Llama 3.2 11B Vision',
    description: 'Faster, cheaper open-source vision model.',
    tier: 'cheap',
    vision: true,
    contextLength: 131_072,
  },
  {
    provider: 'openrouter',
    id: 'qwen/qwen-2-vl-72b-instruct',
    label: 'Qwen2-VL 72B',
    description: 'Strong multilingual vision model.',
    tier: 'cheap',
    vision: true,
    contextLength: 32_768,
  },
  {
    provider: 'openrouter',
    id: 'anthropic/claude-haiku-4-5',
    label: 'Claude Haiku 4.5',
    description: 'Fast, accurate, best-in-class for structured extraction.',
    tier: 'premium',
    vision: true,
    contextLength: 200_000,
  },
  {
    provider: 'openrouter',
    id: 'openai/gpt-4o-mini',
    label: 'GPT-4o Mini',
    description: 'OpenAI vision model. Reliable structured output.',
    tier: 'cheap',
    vision: true,
    contextLength: 128_000,
  },
];

export const DEFAULT_MODEL: ModelEntry = MODEL_CATALOG[0];

export const DEFAULT_FALLBACK_CHAIN: { provider: ProviderId; model: string }[] = [
  { provider: 'gemini', model: 'gemini-2.5-flash' },
  { provider: 'openrouter', model: 'meta-llama/llama-3.2-11b-vision-instruct' },
];

export function findModel(provider: ProviderId, id: string): ModelEntry | undefined {
  return MODEL_CATALOG.find((m) => m.provider === provider && m.id === id);
}

export function visionModels(): ModelEntry[] {
  return MODEL_CATALOG.filter((m) => m.vision);
}
