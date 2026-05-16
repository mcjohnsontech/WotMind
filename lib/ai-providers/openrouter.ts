import {
  type AIProvider,
  type OCRRequest,
  type OCRResponse,
  ProviderError,
  RECEIPT_OCR_PROMPT,
  parseOcrJson,
} from './types';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

function authHeaders() {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new ProviderError({
      message: 'OPENROUTER_API_KEY not configured',
      category: 'auth',
      provider: 'openrouter',
    });
  }
  return {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://wotmind.app',
    'X-Title': 'Wotmind',
  };
}

function categorizeStatus(status: number): 'quota_exceeded' | 'rate_limited' | 'auth' | 'unavailable' | 'invalid_input' | 'unknown' {
  if (status === 402) return 'quota_exceeded';
  if (status === 429) return 'rate_limited';
  if (status === 401 || status === 403) return 'auth';
  if (status === 400 || status === 422) return 'invalid_input';
  if (status >= 500) return 'unavailable';
  return 'unknown';
}

export const openRouterProvider: AIProvider = {
  id: 'openrouter',

  supportsVision(_modelId: string) {
    // OpenRouter doesn't expose this synchronously; we rely on the registry
    // to mark vision-capable models. If a non-vision model is selected,
    // the API will return 400 and we'll categorize as invalid_input → fallback.
    return true;
  },

  async extractReceiptData(req: OCRRequest, modelId: string): Promise<OCRResponse> {
    const headers = authHeaders();

    const body = {
      model: modelId,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: RECEIPT_OCR_PROMPT },
            {
              type: 'image_url',
              image_url: { url: `data:${req.mimeType};base64,${req.imageBase64}` },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    };

    let res: Response;
    try {
      res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
    } catch (err) {
      throw new ProviderError({
        message: err instanceof Error ? err.message : 'OpenRouter request failed',
        category: 'unavailable',
        provider: 'openrouter',
        modelId,
        cause: err,
      });
    }

    if (!res.ok) {
      const text = await res.text();
      throw new ProviderError({
        message: `OpenRouter ${res.status}: ${text.slice(0, 200)}`,
        category: categorizeStatus(res.status),
        provider: 'openrouter',
        modelId,
        status: res.status,
      });
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      throw new ProviderError({
        message: 'OpenRouter response missing content',
        category: 'unknown',
        provider: 'openrouter',
        modelId,
      });
    }

    const result = parseOcrJson(content);
    return {
      result,
      usage: json.usage
        ? {
            prompt_tokens: json.usage.prompt_tokens,
            completion_tokens: json.usage.completion_tokens,
            total_tokens: json.usage.total_tokens,
          }
        : undefined,
    };
  },
};

export interface OpenRouterModelInfo {
  id: string;
  name: string;
  context_length?: number;
  pricing?: { prompt?: string; completion?: string };
  architecture?: { modality?: string; input_modalities?: string[] };
}

export async function fetchOpenRouterModels(): Promise<OpenRouterModelInfo[]> {
  const headers = authHeaders();
  const res = await fetch('https://openrouter.ai/api/v1/models', { headers });
  if (!res.ok) {
    throw new ProviderError({
      message: `Failed to list OpenRouter models: ${res.status}`,
      category: categorizeStatus(res.status),
      provider: 'openrouter',
      status: res.status,
    });
  }
  const json = await res.json();
  return json.data ?? [];
}
