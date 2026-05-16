import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  type AIProvider,
  type OCRRequest,
  type OCRResponse,
  ProviderError,
  RECEIPT_OCR_PROMPT,
  parseOcrJson,
} from './types';

const VISION_MODELS = new Set([
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
]);

function categorizeError(err: unknown): {
  category: 'quota_exceeded' | 'rate_limited' | 'auth' | 'unavailable' | 'unknown';
  status?: number;
} {
  const message = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
  const status = (err as { status?: number; statusCode?: number })?.status
    ?? (err as { status?: number; statusCode?: number })?.statusCode;

  if (status === 429 || message.includes('quota')) return { category: 'quota_exceeded', status };
  if (status === 503 || message.includes('overloaded') || message.includes('unavailable')) return { category: 'unavailable', status };
  if (status === 401 || status === 403 || message.includes('api key')) return { category: 'auth', status };
  return { category: 'unknown', status };
}

export const geminiProvider: AIProvider = {
  id: 'gemini',

  supportsVision(modelId: string) {
    return VISION_MODELS.has(modelId);
  },

  async extractReceiptData(req: OCRRequest, modelId: string): Promise<OCRResponse> {
    if (!process.env.GEMINI_API_KEY) {
      throw new ProviderError({
        message: 'GEMINI_API_KEY not configured',
        category: 'auth',
        provider: 'gemini',
        modelId,
      });
    }

    try {
      const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = client.getGenerativeModel({ model: modelId });

      const response = await model.generateContent([
        { inlineData: { data: req.imageBase64, mimeType: req.mimeType } },
        { text: RECEIPT_OCR_PROMPT },
      ]);

      const text = response.response.text();
      const result = parseOcrJson(text);

      const usage = response.response.usageMetadata;
      return {
        result,
        usage: usage
          ? {
              prompt_tokens: usage.promptTokenCount,
              completion_tokens: usage.candidatesTokenCount,
              total_tokens: usage.totalTokenCount,
            }
          : undefined,
      };
    } catch (err) {
      if (err instanceof ProviderError) throw err;
      const { category, status } = categorizeError(err);
      throw new ProviderError({
        message: err instanceof Error ? err.message : 'Gemini request failed',
        category,
        provider: 'gemini',
        modelId,
        status,
        cause: err,
      });
    }
  },
};
