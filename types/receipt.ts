export interface LineItem {
  description: string;
  quantity?: number;
  unit_price?: number;
  total?: number;
}

export interface OcrResult {
  vendor_name: string | null;
  vendor_address: string | null;
  amount: number | null;
  currency: string;
  receipt_date: string | null;
  receipt_number: string | null;
  line_items: LineItem[];
  confidence: number;
  raw_text: string;
  extraction_notes: string;
}

export interface Receipt {
  id: string;
  run_id?: string;
  user_id: string;
  storage_path: string;
  image_hash: string;
  vendor_name?: string;
  amount?: number;
  currency: string;
  receipt_date?: string;
  receipt_number?: string;
  line_items: LineItem[];
  ocr_confidence?: number;
  created_at: string;
}
