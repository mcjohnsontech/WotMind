export interface InventoryItem {
  id: string;
  user_id: string;
  name: string;
  sku?: string;
  category?: string;
  current_stock: number;
  reorder_threshold: number;
  max_stock?: number;
  unit_cost?: number;
  supplier_name?: string;
  supplier_contact?: string;
  expiry_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReorderAlert {
  item: InventoryItem;
  deficit: number;
  urgency: 'warning' | 'critical';
}
