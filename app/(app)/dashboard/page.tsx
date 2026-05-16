'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Zap,
  Workflow as WorkflowIcon,
  ArrowUpRight,
  Clock,
  Sparkles,
  Shield,
  Layers,
} from 'lucide-react';
import { getNodeDefinition } from '@/lib/workflow/node-registry';
import { cn } from '@/lib/utils/cn';
import { SetupBanner } from '@/components/layout/setup-banner';
import { useAuth } from '@/components/layout/auth-provider';

interface StatProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

function StatCard({ label, value, hint, icon, color, bgColor }: StatProps) {
  return (
    <div className="bg-surface-1 border border-border rounded-xl p-4 hover:border-border-glow/30 transition-all group">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-text-tertiary font-semibold uppercase tracking-widest mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold text-text-primary tracking-tight leading-tight">
            {value}
          </p>
          {hint && (
            <p className="text-[11px] text-text-tertiary mt-1">{hint}</p>
          )}
        </div>
        <div
          className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform',
            bgColor,
            color
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function timeAgo(date: string) {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function Dashboard() {
  const { profile, user } = useAuth();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || '';

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/workflows');
        const data = await res.json();
        setWorkflows(data.workflows || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const activeCount = workflows.filter((w) => w.status === 'active').length;
  const totalNodes = workflows.reduce(
    (sum, w) => sum + (Array.isArray(w.nodes) ? w.nodes.length : 0),
    0
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-[1500px] mx-auto">
      <SetupBanner />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight truncate">
            Welcome back{firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="text-[13px] sm:text-sm text-text-secondary">
            Here&apos;s what&apos;s happening with your automations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/workflows/new">
            <Button variant="primary" size="sm">
              <Sparkles className="w-3.5 h-3.5" />
              New Workflow
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Workflows"
          value={workflows.length}
          hint={`${activeCount} active`}
          icon={<WorkflowIcon className="w-4 h-4" />}
          color="text-accent-primary"
          bgColor="bg-accent-primary/10"
        />
        <StatCard
          label="Active"
          value={activeCount}
          hint="Ready to run"
          icon={<Zap className="w-4 h-4" />}
          color="text-accent-green"
          bgColor="bg-accent-green/10"
        />
        <StatCard
          label="Total Nodes"
          value={totalNodes}
          hint="Across all flows"
          icon={<Layers className="w-4 h-4" />}
          color="text-accent-blue"
          bgColor="bg-accent-blue/10"
        />
        <StatCard
          label="Engine"
          value="Gemini 2.5"
          hint="AI workflow builder"
          icon={<Sparkles className="w-4 h-4" />}
          color="text-accent-purple"
          bgColor="bg-accent-purple/10"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
        {/* Workflows */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-text-primary">
              Recent workflows
            </h2>
            <Link
              href="/workflows"
              className="text-xs text-text-secondary hover:text-accent-primary transition-colors flex items-center gap-1"
            >
              View all
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-xl bg-surface-1 border border-border animate-pulse"
                />
              ))}
            </div>
          ) : workflows.length === 0 ? (
            <div className="bg-surface-1 border border-border rounded-xl py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-accent-primary" />
              </div>
              <h3 className="text-base font-semibold text-text-primary mb-1">
                Build your first workflow
              </h3>
              <p className="text-sm text-text-secondary mb-5 max-w-sm mx-auto">
                Describe your automation in plain English and AI assembles it in real-time.
              </p>
              <Link href="/workflows/new">
                <Button variant="primary" size="sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  Create with AI
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {workflows.slice(0, 5).map((wf: any, idx) => {
                const nodes = (wf.nodes || []) as any[];
                const previewNodes = nodes.slice(0, 4);
                return (
                  <Link key={wf.id} href={`/workflows/${wf.id}`}>
                    <div
                      className="bg-surface-1 border border-border hover:border-accent-primary/30 rounded-xl px-4 py-3 cursor-pointer group transition-all"
                      style={{ animation: `fade-in 0.3s ease ${idx * 0.05}s both` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center shrink-0 group-hover:bg-accent-primary/20 transition-colors">
                          <WorkflowIcon className="w-4 h-4 text-accent-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-[13px] font-semibold text-text-primary truncate group-hover:text-accent-primary transition-colors">
                              {wf.name}
                            </p>
                            <Badge
                              variant={wf.status === 'active' ? 'success' : 'warning'}
                              size="sm"
                              dot
                            >
                              {wf.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {previewNodes.length === 0 ? (
                              <span className="text-[11px] text-text-tertiary">
                                Empty workflow
                              </span>
                            ) : (
                              previewNodes.map((n: any, i: number) => {
                                const def = getNodeDefinition(n.type);
                                const Icon = def.icon;
                                return (
                                  <div key={n.id || i} className="flex items-center gap-1">
                                    <div
                                      className={cn(
                                        'w-4 h-4 rounded flex items-center justify-center',
                                        def.bgColor
                                      )}
                                    >
                                      <Icon className={cn('w-2.5 h-2.5', def.color)} />
                                    </div>
                                    {i < previewNodes.length - 1 && (
                                      <div className="w-1.5 h-px bg-border" />
                                    )}
                                  </div>
                                );
                              })
                            )}
                            {nodes.length > previewNodes.length && (
                              <span className="text-[10px] text-text-tertiary">
                                +{nodes.length - previewNodes.length}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[11px] text-text-tertiary flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          {timeAgo(wf.updated_at)}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-text-tertiary group-hover:text-accent-primary transition-colors shrink-0" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="space-y-3">
            <h2 className="text-[15px] font-semibold text-text-primary">Quick Start</h2>
            <div className="space-y-2">
              <Link href="/workflows/new">
                <div className="bg-surface-1 border border-border hover:border-accent-primary/30 rounded-xl p-3 cursor-pointer group transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-accent-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
                        AI Workflow Builder
                      </p>
                      <p className="text-[11px] text-text-tertiary">
                        Describe what you want, AI builds it
                      </p>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-text-tertiary group-hover:text-accent-primary transition-colors" />
                  </div>
                </div>
              </Link>

              <Link href="/demo">
                <div className="bg-surface-1 border border-border hover:border-accent-green/30 rounded-xl p-3 cursor-pointer group transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-accent-green-muted border border-accent-green/30 flex items-center justify-center shrink-0">
                      <Activity className="w-4 h-4 text-accent-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-semibold text-text-primary group-hover:text-accent-green transition-colors">
                        Live Demo
                      </p>
                      <p className="text-[11px] text-text-tertiary">
                        OCR → Trust → Transfer flow
                      </p>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-text-tertiary group-hover:text-accent-green transition-colors" />
                  </div>
                </div>
              </Link>

              <Link href="/audit">
                <div className="bg-surface-1 border border-border hover:border-accent-blue/30 rounded-xl p-3 cursor-pointer group transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-accent-blue-muted border border-accent-blue/30 flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4 text-accent-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-semibold text-text-primary group-hover:text-accent-blue transition-colors">
                        Audit Trail
                      </p>
                      <p className="text-[11px] text-text-tertiary">
                        Every event, immutably logged
                      </p>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-text-tertiary group-hover:text-accent-blue transition-colors" />
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* System Status */}
          <div className="space-y-3">
            <h2 className="text-[15px] font-semibold text-text-primary">System Status</h2>
            <div className="bg-surface-1 border border-border rounded-xl p-4 space-y-3">
              {[
                { label: 'AI Engine (Gemini)', status: 'operational', color: 'bg-accent-green' },
                { label: 'Trust Engine', status: 'operational', color: 'bg-accent-green' },
                { label: 'Squad API', status: 'sandbox', color: 'bg-accent-amber' },
                { label: 'Supabase', status: 'connected', color: 'bg-accent-green' },
                { label: 'Twilio SMS', status: 'configured', color: 'bg-accent-green' },
              ].map((service) => (
                <div key={service.label} className="flex items-center justify-between">
                  <span className="text-[12px] text-text-secondary">{service.label}</span>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${service.color} animate-pulse-soft`} />
                    <span className="text-[11px] text-text-tertiary">{service.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
