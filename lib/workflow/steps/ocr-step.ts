import { extractReceiptData } from '@/lib/gemini/client';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { type OcrResult } from '@/types/receipt';

export interface OcrStepInput {
  receipt_id: string;
  storage_path: string;
  file_data?: {
    base64: string;
    mimeType: string;
  };
}

export interface OcrStepOutput {
  ocr_result: OcrResult;
  storage_path: string;
}

export async function executeOcrStep(
  input: OcrStepInput
): Promise<OcrStepOutput> {
  if (!input.file_data) {
    throw new Error('OCR step requires file_data with base64 and mimeType');
  }

  const { base64, mimeType } = input.file_data;

  // Call Gemini
  const ocrResult = await extractReceiptData(base64, mimeType);

  // Update receipt record with extracted data
  const supabase = await getSupabaseServiceRoleClient();
  await supabase
    .from('receipts')
    .update({
      vendor_name: ocrResult.vendor_name,
      amount: ocrResult.amount,
      receipt_date: ocrResult.receipt_date,
      receipt_number: ocrResult.receipt_number,
      line_items: ocrResult.line_items,
      ocr_confidence: ocrResult.confidence,
      ocr_raw: ocrResult.raw_text,
    })
    .eq('id', input.receipt_id);

  // Log audit event
  await supabase.from('audit_events').insert({
    event_type: 'ocr.completed',
    entity_type: 'receipt',
    entity_id: input.receipt_id,
    metadata: {
      confidence: ocrResult.confidence,
      vendor: ocrResult.vendor_name,
      amount: ocrResult.amount,
    },
    severity: 'info',
  });

  return {
    ocr_result: ocrResult,
    storage_path: input.storage_path,
  };
}
