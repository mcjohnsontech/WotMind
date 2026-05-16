import { type OcrResult } from '@/types/receipt';

export type ProviderId = 'gemini' | 'openrouter';

export type ErrorCategory =
  | 'quota_exceeded'
  | 'rate_limited'
  | 'auth'
  | 'invalid_input'
  | 'unavailable'
  | 'unknown';

export class ProviderError extends Error {
  category: ErrorCategory;
  provider: ProviderId;
  modelId?: string;
  status?: number;
  retryable: boolean;

  constructor(args: {
    message: string;
    category: ErrorCategory;
    provider: ProviderId;
    modelId?: string;
    status?: number;
    retryable?: boolean;
    cause?: unknown;
  }) {
    super(args.message);
    this.name = 'ProviderError';
    this.category = args.category;
    this.provider = args.provider;
    this.modelId = args.modelId;
    this.status = args.status;
    this.retryable = args.retryable ?? (args.category === 'rate_limited' || args.category === 'unavailable');
    if (args.cause) (this as Error & { cause?: unknown }).cause = args.cause;
  }
}

export interface OCRRequest {
  imageBase64: string;
  mimeType: string;
}

export interface OCRResponse {
  result: OcrResult;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export interface AIProvider {
  id: ProviderId;
  supportsVision(modelId: string): boolean;
  extractReceiptData(req: OCRRequest, modelId: string): Promise<OCRResponse>;
}

export const RECEIPT_OCR_PROMPT = `You are an expert OCR system specializing in receipt extraction.

Analyze the provided receipt image and extract the following information in strict JSON format:

{
  "vendor_name": "string or null",
  "vendor_address": "string or null",
  "amount": "number or null (the total amount)",
  "currency": "string (default 'NGN')",
  "receipt_date": "string (ISO date format YYYY-MM-DD) or null",
  "receipt_number": "string or null",
  "line_items": [
    {
      "description": "string",
      "quantity": "number or null",
      "unit_price": "number or null",
      "total": "number or null"
    }
  ],
  "confidence": "number (0.0 to 1.0, your confidence in the extraction)",
  "raw_text": "string (all text you can read from the receipt)",
  "extraction_notes": "string (any notes about extraction quality or assumptions)"
}

IMPORTANT:
- Return ONLY valid JSON, no markdown or extra text
- Set confidence to 0.0-1.0 based on receipt clarity and completeness
- If a field cannot be extracted, use null instead of empty string
- For amount, extract the final total, not subtotals
- Assume currency is NGN unless explicitly shown
- Return empty array for line_items if they cannot be clearly identified`;

export function parseOcrJson(text: string): OcrResult {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to extract JSON from model response');
  }
  const parsed = JSON.parse(jsonMatch[0]);

  if (typeof parsed.confidence !== 'number') parsed.confidence = 0.5;

  return {
    vendor_name: parsed.vendor_name || null,
    vendor_address: parsed.vendor_address || null,
    amount: parsed.amount,
    currency: parsed.currency || 'NGN',
    receipt_date: parsed.receipt_date || null,
    receipt_number: parsed.receipt_number || null,
    line_items: parsed.line_items || [],
    confidence: Math.max(0, Math.min(1, parsed.confidence)),
    raw_text: parsed.raw_text || text,
    extraction_notes: parsed.extraction_notes || '',
  };
}
