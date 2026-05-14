import { GoogleGenerativeAI } from '@google/generative-ai';
import { type OcrResult } from '@/types/receipt';

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function extractReceiptData(
  imageBase64: string,
  mimeType: string
): Promise<OcrResult> {
  const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `You are an expert OCR system specializing in receipt extraction.

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

  const response = await model.generateContent([
    {
      inlineData: {
        data: imageBase64,
        mimeType,
      },
    },
    {
      text: prompt,
    },
  ]);

  const text = response.response.text();

  // Extract JSON from response (might contain markdown)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to extract JSON from Gemini response');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // Ensure confidence is a number
  if (typeof parsed.confidence !== 'number') {
    parsed.confidence = 0.5;
  }

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
