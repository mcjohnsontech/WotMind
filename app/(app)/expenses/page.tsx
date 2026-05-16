'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Receipt } from 'lucide-react';

export default function ExpensesPage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-text-primary">Expenses</h1>
          <p className="text-text-secondary">
            Submit and approve expense claims
          </p>
        </div>
        <Button variant="primary" size="lg" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Submit Expense
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Pending Approval</p>
                <p className="text-2xl font-bold text-accent-amber">0</p>
              </div>
              <Receipt className="w-8 h-8 text-accent-amber" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Approved</p>
                <p className="text-2xl font-bold text-accent-green">0</p>
              </div>
              <Receipt className="w-8 h-8 text-accent-green" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Claimed</p>
                <p className="text-2xl font-bold text-text-primary">₦0</p>
              </div>
              <Receipt className="w-8 h-8 text-text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="text-center p-12">
        <Receipt className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-text-primary mb-2">
          No Expenses
        </h3>
        <p className="text-text-secondary mb-6">
          Submit an expense claim to get started
        </p>
        <Button variant="primary">Submit Expense</Button>
      </Card>
    </div>
  );
}
