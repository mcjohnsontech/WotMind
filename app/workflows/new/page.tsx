'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function NewWorkflowPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: 'Default demo workflow' }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/workflows/${data.workflow.id}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-primary">
                Workflow Name
              </label>
              <Input
                type="text"
                placeholder="e.g., Fuel Reimbursement"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading || !name}
              >
                {isLoading ? 'Creating...' : 'Create Workflow'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
