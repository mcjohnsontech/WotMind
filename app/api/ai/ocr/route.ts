import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { extractReceiptForUser } from '@/lib/ai-providers/router';
import { hashImage, getMimeType } from '@/lib/utils/hash';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Hash image for duplicate detection
    const imageHash = await hashImage(file);

    // Convert to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = getMimeType(file);

    // Extract OCR data via user's preferred provider, with fallback
    const extraction = await extractReceiptForUser(user.id, {
      imageBase64: base64,
      mimeType,
    });
    const ocrResult = extraction.ocr;

    // Upload to Supabase Storage
    const serviceSupabase = await getSupabaseServiceRoleClient();
    const fileName = `${Date.now()}-${imageHash.slice(0, 8)}.jpg`;
    const { data: uploadData, error: uploadError } =
  await serviceSupabase.storage
    .from('receipts')
    .upload(`${user.id}/${fileName}`, buffer, {
      contentType: mimeType,
      upsert: true,
    });

if (uploadError) {
  console.error(uploadError);
  throw new Error(uploadError.message);
}

    // Create receipt record
    const { data: receipt } = await serviceSupabase
      .from('receipts')
      .insert({
        user_id: user.id,
        storage_path: uploadData.path,
        image_hash: imageHash,
        vendor_name: ocrResult.vendor_name,
        amount: ocrResult.amount,
        receipt_date: ocrResult.receipt_date,
        receipt_number: ocrResult.receipt_number,
        line_items: ocrResult.line_items,
        ocr_confidence: ocrResult.confidence,
        ocr_raw: ocrResult.raw_text,
        currency: 'NGN',
      })
      .select()
      .single();

    if (!receipt) {
      throw new Error('Failed to create receipt record');
    }

    // Audit log
    await serviceSupabase.from('audit_events').insert({
      user_id: user.id,
      event_type: 'receipt.uploaded',
      entity_type: 'receipt',
      entity_id: receipt.id,
      metadata: {
        confidence: ocrResult.confidence,
        vendor: ocrResult.vendor_name,
        amount: ocrResult.amount,
        ai_provider: extraction.provider,
        ai_model: extraction.model,
        ai_fallback_used: extraction.fallbackUsed,
      },
      severity: 'info',
    });

    return NextResponse.json({
      receipt_id: receipt.id,
      ocr_result: ocrResult,
      storage_path: uploadData.path,
      ai: {
        provider: extraction.provider,
        model: extraction.model,
        fallback_used: extraction.fallbackUsed,
      },
    });
  } catch (error) {
    console.error('OCR error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'OCR processing failed' },
      { status: 500 }
    );
  }
}
