'use client';

export const dynamic = 'force-dynamic';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Activity, Zap, Shield, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      {/* Hero */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary">
          Operational intelligence powered by trust
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Runs</p>
                <p className="text-2xl font-bold text-text-primary">0</p>
              </div>
              <Activity className="w-8 h-8 text-border-glow" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Success Rate</p>
                <p className="text-2xl font-bold text-accent-green">—</p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent-green" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Avg Trust Score</p>
                <p className="text-2xl font-bold text-border-glow">—</p>
              </div>
              <Shield className="w-8 h-8 text-border-glow" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Transferred</p>
                <p className="text-2xl font-bold text-accent-amber">₦0</p>
              </div>
              <Zap className="w-8 h-8 text-accent-amber" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <Card className="bg-surface-2 border-border-glow/30">
        <CardHeader>
          <CardTitle className="text-accent-amber">
            Start the Live Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary mb-4">
            Upload a fuel receipt and watch the full workflow execute in real
            time: OCR extraction, trust verification, and Squad transfer.
          </p>
          <Link href="/demo">
            <Button variant="primary">Run Demo</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
