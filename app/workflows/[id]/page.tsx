'use client';

import { Card, CardContent } from '@/components/ui/card';

export default function WorkflowPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="p-8">
      <Card>
        <CardContent className="pt-6">
          <p className="text-text-secondary">
            Workflow canvas will be available in the next phase. For now, use the demo page to test the full workflow.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
