'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type OcrResult } from '@/types/receipt';
import { formatCurrency, formatDate } from '@/lib/utils/format';

export interface OcrResultProps {
  result: OcrResult;
}

export function OcrResult({ result }: OcrResultProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Extracted Receipt Data</CardTitle>
          <Badge variant={result.confidence >= 0.75 ? 'success' : 'warning'}>
            {(result.confidence * 100).toFixed(0)}% confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-text-secondary uppercase tracking-wide">
              Vendor
            </label>
            <p className="text-lg font-medium text-text-primary">
              {result.vendor_name || 'Unknown'}
            </p>
          </div>

          <div>
            <label className="text-xs text-text-secondary uppercase tracking-wide">
              Amount
            </label>
            <p className="text-lg font-medium text-accent-amber">
              {result.amount
                ? formatCurrency(result.amount)
                : 'Not detected'}
            </p>
          </div>

          <div>
            <label className="text-xs text-text-secondary uppercase tracking-wide">
              Receipt Date
            </label>
            <p className="text-base text-text-primary">
              {result.receipt_date
                ? formatDate(result.receipt_date, 'MMM d, yyyy')
                : 'Not detected'}
            </p>
          </div>

          <div>
            <label className="text-xs text-text-secondary uppercase tracking-wide">
              Receipt #
            </label>
            <p className="text-base text-text-primary">
              {result.receipt_number || 'Not detected'}
            </p>
          </div>
        </div>

        {result.extraction_notes && (
          <div className="pt-4 border-t border-border">
            <label className="text-xs text-text-secondary uppercase tracking-wide">
              Notes
            </label>
            <p className="text-sm text-text-secondary mt-1">
              {result.extraction_notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
