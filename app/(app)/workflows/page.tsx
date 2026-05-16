'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Workflow as WorkflowIcon,
  Search,
  Sparkles,
  Clock,
  Trash2,
  Power,
  PowerOff,
  Grid3X3,
  List as ListIcon,
  ArrowUpRight,
} from 'lucide-react';
import { type Workflow } from '@/types/workflow';
import { cn } from '@/lib/utils/cn';
import { getNodeDefinition } from '@/lib/workflow/node-registry';
import toast from 'react-hot-toast';

function timeAgo(date: string) {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'archived'>('all');
  const [sort, setSort] = useState<'updated' | 'created' | 'name'>('updated');

  useEffect(() => {
    const fetchWorkflows = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/workflows');
        const data = await response.json();
        setWorkflows(data.workflows || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkflows();
  }, []);

  const filtered = useMemo(() => {
    let result = workflows
      .filter((w) => filter === 'all' || w.status === filter)
      .filter(
        (w) =>
          !search ||
          w.name.toLowerCase().includes(search.toLowerCase()) ||
          w.description?.toLowerCase().includes(search.toLowerCase())
      );

    result = [...result].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'created')
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    return result;
  }, [workflows, filter, search, sort]);

  const stats = useMemo(() => {
    const active = workflows.filter((w) => w.status === 'active').length;
    const paused = workflows.filter((w) => w.status === 'paused').length;
    return { total: workflows.length, active, paused };
  }, [workflows]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this workflow?')) return;

    try {
      await fetch(`/api/workflows/${id}`, { method: 'DELETE' });
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
      toast.success('Workflow deleted');
    } catch (err) {
      console.error(err);
      toast.error('Could not delete');
    }
  };

  const toggleStatus = async (wf: Workflow, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = wf.status === 'active' ? 'paused' : 'active';
    try {
      await fetch(`/api/workflows/${wf.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      setWorkflows((prev) =>
        prev.map((w) => (w.id === wf.id ? { ...w, status: next } : w))
      );
      toast.success(next === 'active' ? 'Activated' : 'Paused');
    } catch {
      toast.error('Could not update');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-[1500px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
            Workflows
          </h1>
          <p className="text-[12px] sm:text-sm text-text-secondary">
            {stats.total} total · {stats.active} active · {stats.paused} paused
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/workflows/new">
            <Button variant="primary" size="sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Workflow</span>
              <span className="sm:hidden">New</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="space-y-2">
        <div className="w-full">
          <Input
            placeholder="Search workflows…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-3.5 h-3.5" />}
            aria-label="Search workflows"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-surface-1 rounded-lg p-0.5 border border-border overflow-x-auto" role="tablist" aria-label="Filter by status">
            {(['all', 'active', 'paused', 'archived'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                role="tab"
                aria-selected={filter === f}
                className={cn(
                  'px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors capitalize whitespace-nowrap',
                  filter === f
                    ? 'bg-surface-3 text-text-primary'
                    : 'text-text-tertiary hover:text-text-secondary'
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            aria-label="Sort workflows"
            className="bg-surface-1 border border-border rounded-lg px-3 py-1.5 text-[12px] text-text-secondary outline-none cursor-pointer hover:border-border/80 transition-colors"
          >
            <option value="updated">Recently updated</option>
            <option value="created">Recently created</option>
            <option value="name">Name (A–Z)</option>
          </select>

          <div className="hidden sm:flex items-center gap-0.5 bg-surface-1 rounded-lg p-0.5 border border-border ml-auto" role="radiogroup" aria-label="View mode">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              role="radio"
              aria-checked={viewMode === 'grid'}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'grid'
                  ? 'bg-surface-3 text-text-primary'
                  : 'text-text-tertiary hover:text-text-secondary'
              )}
              title="Grid view"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              role="radio"
              aria-checked={viewMode === 'list'}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-surface-3 text-text-primary'
                  : 'text-text-tertiary hover:text-text-secondary'
              )}
              title="List view"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-2'
          )}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={cn(
                'rounded-xl bg-surface-1 border border-border animate-pulse',
                viewMode === 'grid' ? 'h-44' : 'h-16'
              )}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface-1 border border-border rounded-2xl py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mx-auto mb-4">
            {search ? (
              <Search className="w-7 h-7 text-text-tertiary" />
            ) : (
              <WorkflowIcon className="w-7 h-7 text-text-tertiary" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            {search ? 'No results' : 'No workflows yet'}
          </h3>
          <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">
            {search
              ? `Nothing matches "${search}"`
              : 'Describe what you want to automate in plain English. AI builds it instantly.'}
          </p>
          {!search && (
            <Link href="/workflows/new">
              <Button variant="primary" size="sm">
                <Sparkles className="w-3.5 h-3.5" />
                Create with AI
              </Button>
            </Link>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((workflow, idx) => {
            const nodes = (workflow.nodes || []) as any[];
            const previewNodes = nodes.slice(0, 5);
            return (
              <Link key={workflow.id} href={`/workflows/${workflow.id}`}>
                <div
                  className="group h-full bg-surface-1 border border-border rounded-xl hover:border-accent-primary/30 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col overflow-hidden"
                  style={{ animation: `fade-in-up 0.3s ease ${Math.min(idx, 8) * 0.04}s both` }}
                >
                  {/* Node preview strip */}
                  <div className="px-4 pt-4 pb-2 bg-canvas-bg/40 border-b border-border-subtle">
                    {previewNodes.length === 0 ? (
                      <div className="flex items-center justify-center h-12">
                        <span className="text-[11px] text-text-tertiary">Empty workflow</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {previewNodes.map((n, i) => {
                          const def = getNodeDefinition(n.type);
                          const Icon = def.icon;
                          return (
                            <div key={n.id || i} className="flex items-center gap-1.5 shrink-0">
                              <div
                                className={cn(
                                  'w-7 h-7 rounded-md flex items-center justify-center border',
                                  def.bgColor,
                                  def.borderColor
                                )}
                              >
                                <Icon className={cn('w-3.5 h-3.5', def.color)} />
                              </div>
                              {i < previewNodes.length - 1 && (
                                <div className="w-3 h-px bg-border-subtle" />
                              )}
                            </div>
                          );
                        })}
                        {nodes.length > previewNodes.length && (
                          <span className="text-[10px] text-text-tertiary ml-1 shrink-0">
                            +{nodes.length - previewNodes.length}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-[14px] font-semibold text-text-primary group-hover:text-accent-primary transition-colors leading-tight line-clamp-1">
                        {workflow.name}
                      </h3>
                      <Badge
                        variant={
                          workflow.status === 'active'
                            ? 'success'
                            : workflow.status === 'paused'
                              ? 'warning'
                              : 'default'
                        }
                        size="sm"
                        dot
                      >
                        {workflow.status}
                      </Badge>
                    </div>

                    <p className="text-[12px] text-text-tertiary line-clamp-2 leading-relaxed mb-3 flex-1">
                      {workflow.description || 'No description'}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                      <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(workflow.updated_at)}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => toggleStatus(workflow, e)}
                          className="p-1.5 rounded text-text-tertiary hover:text-accent-primary hover:bg-surface-2 transition-colors"
                          title={workflow.status === 'active' ? 'Pause' : 'Activate'}
                        >
                          {workflow.status === 'active' ? (
                            <PowerOff className="w-3 h-3" />
                          ) : (
                            <Power className="w-3 h-3" />
                          )}
                        </button>
                        <button
                          onClick={(e) => handleDelete(workflow.id, e)}
                          className="p-1.5 rounded text-text-tertiary hover:text-accent-red hover:bg-accent-red-muted transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-surface-1 border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2 border-b border-border-subtle text-[10px] font-semibold text-text-tertiary uppercase tracking-widest">
            <span>Name</span>
            <span>Nodes</span>
            <span>Status</span>
            <span>Updated</span>
            <span className="w-20" />
          </div>
          <div className="divide-y divide-border-subtle">
            {filtered.map((workflow, idx) => (
              <Link key={workflow.id} href={`/workflows/${workflow.id}`}>
                <div
                  className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-3 hover:bg-surface-2 transition-colors group"
                  style={{ animation: `fade-in 0.2s ease ${Math.min(idx, 12) * 0.02}s both` }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center shrink-0">
                      <WorkflowIcon className="w-4 h-4 text-accent-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-text-primary truncate group-hover:text-accent-primary transition-colors">
                        {workflow.name}
                      </p>
                      <p className="text-[11px] text-text-tertiary truncate">
                        {workflow.description || 'No description'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-text-tertiary">
                    {workflow.nodes?.length || 0}
                  </span>
                  <Badge
                    variant={workflow.status === 'active' ? 'success' : 'warning'}
                    size="sm"
                    dot
                  >
                    {workflow.status}
                  </Badge>
                  <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeAgo(workflow.updated_at)}
                  </span>
                  <div className="flex items-center gap-1 w-20 justify-end">
                    <button
                      onClick={(e) => toggleStatus(workflow, e)}
                      className="p-1.5 rounded text-text-tertiary hover:text-accent-primary hover:bg-surface-3 transition-colors opacity-0 group-hover:opacity-100"
                      title={workflow.status === 'active' ? 'Pause' : 'Activate'}
                    >
                      {workflow.status === 'active' ? (
                        <PowerOff className="w-3 h-3" />
                      ) : (
                        <Power className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={(e) => handleDelete(workflow.id, e)}
                      className="p-1.5 rounded text-text-tertiary hover:text-accent-red hover:bg-accent-red-muted transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <ArrowUpRight className="w-3.5 h-3.5 text-text-tertiary group-hover:text-accent-primary transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
