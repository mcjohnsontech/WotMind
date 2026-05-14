'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type TrustReport } from '@/types/trust';
import { Check, X } from 'lucide-react';

export interface TrustDashboardProps {
  report: TrustReport;
}

export function TrustDashboard({ report }: TrustDashboardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Trust Verification</CardTitle>
          <Badge
            variant={
              report.verdict === 'approved'
                ? 'success'
                : report.verdict === 'flagged'
                  ? 'warning'
                  : 'error'
            }
          >
            {report.verdict.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-primary">
              Overall Trust Score
            </label>
            <span className="text-2xl font-bold text-border-glow">
              {(report.overall_score * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-surface-2 rounded-full h-2">
            <div
              className="bg-border-glow h-2 rounded-full transition-all"
              style={{ width: `${report.overall_score * 100}%` }}
            />
          </div>
        </div>

        {/* Explanation */}
        <p className="text-sm text-text-secondary italic">
          {report.explanation}
        </p>

        {/* Check Results */}
        <div className="space-y-3">
          <label className="text-xs text-text-secondary uppercase tracking-wide">
            Verification Checks
          </label>
          {report.check_results.map((check) => (
            <div
              key={check.check_id}
              className="flex items-start gap-3 p-3 bg-surface-2 rounded-md"
            >
              <div className="pt-0.5 flex-shrink-0">
                {check.passed ? (
                  <Check className="w-5 h-5 text-accent-green" />
                ) : (
                  <X className="w-5 h-5 text-accent-red" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">
                  {check.label}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  {check.detail}
                </p>
                <p className="text-xs text-text-secondary mt-1 opacity-60">
                  {check.latency_ms}ms
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-medium text-text-primary">
                  {(check.score * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-text-secondary">
                  {(check.weight * 100).toFixed(0)}% weight
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
