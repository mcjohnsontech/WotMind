'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type Workflow } from '@/types/workflow';
import { Plus, Workflow as WorkflowIcon } from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils/format';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fetchWorkflows = async () => {
      setIsLoading(true);
      const response = await fetch('/api/workflows');
      const data = await response.json();
      setWorkflows(data.workflows || []);
      setIsLoading(false);
    };

    fetchWorkflows();
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-text-primary">Workflows</h1>
          <p className="text-text-secondary">
            Create and manage your intelligent business workflows
          </p>
        </div>
        <Link href="/workflows/new">
          <Button variant="primary" size="lg" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Workflow
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-text-secondary">Loading workflows...</p>
          </CardContent>
        </Card>
      ) : workflows.length === 0 ? (
        <Card className="text-center p-12">
          <WorkflowIcon className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            No workflows yet
          </h3>
          <p className="text-text-secondary mb-6">
            Create your first workflow to get started
          </p>
          <Link href="/workflows/new">
            <Button variant="primary">Create Workflow</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {workflows.map((workflow) => (
            <Link key={workflow.id} href={`/workflows/${workflow.id}`}>
              <Card className="h-full hover:border-border-glow/50 transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <Badge variant="info">
                      {workflow.nodes.length} nodes
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-text-secondary mb-4">
                    {workflow.description || 'No description'}
                  </p>
                  <p className="text-xs text-text-secondary">
                    Updated {formatTimeAgo(workflow.updated_at)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
