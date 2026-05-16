'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import Link from 'next/link';

export default function PayrollPage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-text-primary">Payroll</h1>
          <p className="text-text-secondary">
            Manage staff and execute salary payments
          </p>
        </div>
        <Button variant="primary" size="lg" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Run Payroll
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Staff</p>
                <p className="text-2xl font-bold text-text-primary">0</p>
              </div>
              <Users className="w-8 h-8 text-border-glow" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Payroll Runs</p>
                <p className="text-2xl font-bold text-text-primary">0</p>
              </div>
              <Users className="w-8 h-8 text-border-glow" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Paid</p>
                <p className="text-2xl font-bold text-accent-amber">₦0</p>
              </div>
              <Users className="w-8 h-8 text-accent-amber" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="text-center p-12">
        <Users className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-text-primary mb-2">
          Payroll Setup
        </h3>
        <p className="text-text-secondary mb-6">
          Import staff members and set up payroll automation
        </p>
        <Button variant="primary">Import Staff</Button>
      </Card>
    </div>
  );
}
