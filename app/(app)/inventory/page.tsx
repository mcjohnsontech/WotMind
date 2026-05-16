'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package, AlertCircle } from 'lucide-react';

export default function InventoryPage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-text-primary">Inventory</h1>
          <p className="text-text-secondary">
            Track stock levels and manage reorders
          </p>
        </div>
        <Button variant="primary" size="lg" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Items</p>
                <p className="text-2xl font-bold text-text-primary">0</p>
              </div>
              <Package className="w-8 h-8 text-border-glow" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Low Stock</p>
                <p className="text-2xl font-bold text-accent-amber">0</p>
              </div>
              <AlertCircle className="w-8 h-8 text-accent-amber" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Out of Stock</p>
                <p className="text-2xl font-bold text-accent-red">0</p>
              </div>
              <AlertCircle className="w-8 h-8 text-accent-red" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="text-center p-12">
        <Package className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-text-primary mb-2">
          No Inventory Items
        </h3>
        <p className="text-text-secondary mb-6">
          Add products to track stock levels
        </p>
        <Button variant="primary">Add Item</Button>
      </Card>
    </div>
  );
}
