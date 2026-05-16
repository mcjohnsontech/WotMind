'use client';

export const dynamic = 'force-dynamic';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Play,
  Power,
  PowerOff,
  Trash2,
  Sparkles,
  Phone,
  Check,
  X,
  Clock,
  Activity,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { Input } from '@/components/ui/input';
import { PayrollManager } from '@/components/payroll/payroll-manager';

interface AutomationRun {
  id: string;
  status: string;
  input_data?: Record<string, any> | null;
  ai_assessment?: any;
  result_data?: any;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

interface Automation {
  id: string;
  name: string;
  automation_type: string;
  status: 'active' | 'paused' | 'archived';
  config: Record<string, any>;
  ai_rules: any;
  notification_config: any;
  created_at: string;
  updated_at: string;
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

const STATUS_COLOR: Record<string, string> = {
  completed: 'success',
  awaiting_approval: 'warning',
  blocked: 'error',
  failed: 'error',
  running: 'info',
  pending: 'default',
};

export default function AutomationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [automation, setAutomation] = useState<Automation | null>(null);
  const [runs, setRuns] = useState<AutomationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [testAmount, setTestAmount] = useState('25000');

  const load = useCallback(async () => {
    try {
      const [aRes, rRes] = await Promise.all([
        fetch(`/api/automations/${id}`),
        fetch(`/api/automations/${id}/runs`),
      ]);
      if (!aRes.ok) {
        if (aRes.status === 404) {
          toast.error('Automation not found');
          router.push('/automations');
          return;
        }
        throw new Error('Failed to load');
      }
      const aData = await aRes.json();
      setAutomation(aData.automation);

      if (rRes.ok) {
        const rData = await rRes.json();
        setRuns(rData.runs || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load automation');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleStatus = async () => {
    if (!automation) return;
    const next = automation.status === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch(`/api/automations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
      setAutomation({ ...automation, status: next });
      toast.success(next === 'active' ? 'Activated' : 'Paused');
    } catch {
      toast.error('Could not update');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Archive this automation? You can restore it later.')) return;
    try {
      await fetch(`/api/automations/${id}`, { method: 'DELETE' });
      toast.success('Archived');
      router.push('/automations');
    } catch {
      toast.error('Could not archive');
    }
  };

  const handleTestRun = async () => {
    if (!automation) return;
    setRunning(true);
    try {
      const amount = Number(testAmount) || 0;
      const res = await fetch(`/api/automations/${id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input_data: {
            amount,
            test: true,
            description: 'Manual test run',
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Run failed');

      if (data.status === 'blocked') {
        toast.error(`Blocked: ${data.verdict}`);
      } else if (data.status === 'awaiting_approval') {
        toast(`Awaiting SMS approval`, { icon: '⏳' });
      } else {
        toast.success('Run started');
      }
      // Refresh runs after a short delay so the new run appears
      setTimeout(load, 600);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Run failed');
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="h-8 w-48 bg-surface-1 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-surface-1 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-72 bg-surface-1 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!automation) return null;

  const isActive = automation.status === 'active';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap animate-fade-in">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <Link
            href="/automations"
            aria-label="Back to automations"
            className="p-1.5 rounded-lg hover:bg-surface-2 text-text-tertiary hover:text-text-primary transition-colors mt-1 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight truncate">
                {automation.name}
              </h1>
              <Badge variant={isActive ? 'success' : 'warning'} size="sm" dot>
                {automation.status}
              </Badge>
            </div>
            <p className="text-[12px] text-text-tertiary capitalize">
              {automation.automation_type.replace(/_/g, ' ')} · created{' '}
              {timeAgo(automation.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={toggleStatus}>
            {isActive ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isActive ? 'Pause' : 'Activate'}</span>
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Archive</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Type-specific manager + Runs */}
        <div className="lg:col-span-2 space-y-6">
          {automation.automation_type === 'payroll' ? (
            <PayrollManager automationId={automation.id} />
          ) : (
            /* Generic test runner for non-payroll types */
            <div className="bg-surface-1 border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-[14px] font-semibold text-text-primary mb-0.5">
                    Test this automation
                  </h2>
                  <p className="text-[12px] text-text-tertiary">
                    Run a sample transaction through the AI risk engine.
                  </p>
                </div>
                <div className="px-2 py-1 rounded-md bg-accent-primary/10 border border-accent-primary/20 text-[10px] font-semibold text-accent-primary uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  AI
                </div>
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="text-[11px] font-semibold text-text-tertiary uppercase tracking-widest block mb-1.5">
                    Test amount (₦)
                  </label>
                  <Input
                    type="number"
                    value={testAmount}
                    onChange={(e) => setTestAmount(e.target.value)}
                    placeholder="25000"
                  />
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleTestRun}
                  loading={running}
                  disabled={!isActive}
                >
                  <Play className="w-3.5 h-3.5" />
                  Run test
                </Button>
              </div>

              {!isActive && (
                <p className="text-[11px] text-accent-amber mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Activate to run tests
                </p>
              )}
            </div>
          )}

          {/* Recent runs */}
          <div>
            <h2 className="text-[14px] font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent-primary" />
              Recent runs
              <span className="text-[11px] text-text-tertiary font-normal">
                ({runs.length})
              </span>
            </h2>

            {runs.length === 0 ? (
              <div className="bg-surface-1 border border-border rounded-xl py-10 text-center">
                <div className="w-12 h-12 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-5 h-5 text-text-tertiary" />
                </div>
                <p className="text-sm text-text-secondary mb-1">No runs yet</p>
                <p className="text-[11px] text-text-tertiary">
                  Run a test above to see it here
                </p>
              </div>
            ) : (
              <div className="bg-surface-1 border border-border rounded-xl divide-y divide-border-subtle overflow-hidden">
                {runs.slice(0, 10).map((run) => {
                  const verdict = run.ai_assessment?.verdict;
                  const riskScore = run.ai_assessment?.risk_score;
                  return (
                    <div
                      key={run.id}
                      className="px-4 py-3 hover:bg-surface-2/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                            run.status === 'completed' && 'bg-accent-green/10 text-accent-green',
                            run.status === 'awaiting_approval' &&
                              'bg-accent-amber/10 text-accent-amber',
                            (run.status === 'blocked' || run.status === 'failed') &&
                              'bg-accent-red/10 text-accent-red',
                            run.status === 'running' && 'bg-accent-blue/10 text-accent-blue',
                            run.status === 'pending' && 'bg-surface-3 text-text-tertiary'
                          )}
                        >
                          {run.status === 'completed' && <Check className="w-4 h-4" />}
                          {run.status === 'awaiting_approval' && <Clock className="w-4 h-4" />}
                          {(run.status === 'blocked' || run.status === 'failed') && (
                            <X className="w-4 h-4" />
                          )}
                          {run.status === 'running' && (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          )}
                          {run.status === 'pending' && <Clock className="w-4 h-4" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant={(STATUS_COLOR[run.status] as any) || 'default'}
                              size="sm"
                              dot
                            >
                              {run.status.replace(/_/g, ' ')}
                            </Badge>
                            {verdict && (
                              <span className="text-[10px] text-text-tertiary">
                                verdict: <span className="text-text-secondary">{verdict}</span>
                              </span>
                            )}
                            {riskScore != null && (
                              <span className="text-[10px] text-text-tertiary">
                                risk: <span className="text-text-secondary">{riskScore}</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-text-tertiary mt-0.5">
                            {run.input_data?.amount != null && (
                              <>₦{Number(run.input_data.amount).toLocaleString()} · </>
                            )}
                            {timeAgo(run.created_at)}
                          </p>
                          {run.error_message && (
                            <p className="text-[11px] text-accent-red mt-1 truncate">
                              {run.error_message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Configuration */}
        <div className="space-y-5">
          <div className="bg-surface-1 border border-border rounded-xl p-5">
            <h3 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-widest mb-3">
              AI Rules
            </h3>
            <div className="space-y-3 text-[12px]">
              <ConfigRow
                label="Auto-approve below"
                value={`₦${Number(automation.ai_rules?.auto_approve_below || 0).toLocaleString()}`}
                accent="text-accent-green"
              />
              <ConfigRow
                label="Require approval"
                value={`₦${Number(automation.ai_rules?.require_approval_above || 0).toLocaleString()}+`}
                accent="text-accent-amber"
              />
              <ConfigRow
                label="Hard cap"
                value={`₦${Number(automation.ai_rules?.max_amount || 0).toLocaleString()}`}
                accent="text-accent-red"
              />
              <ConfigRow
                label="Anomaly threshold"
                value={`${automation.ai_rules?.anomaly_score_threshold || 0}%`}
              />
            </div>
          </div>

          <div className="bg-surface-1 border border-border rounded-xl p-5">
            <h3 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-widest mb-3">
              Notifications
            </h3>
            <div className="space-y-2.5 text-[12px]">
              {automation.notification_config?.approval_phone && (
                <div className="flex items-start gap-2">
                  <Phone className="w-3.5 h-3.5 text-text-tertiary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-text-primary truncate">
                      {automation.notification_config.approval_phone}
                    </p>
                    <p className="text-[10px] text-text-tertiary">Approval phone</p>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-1 pt-1">
                {(automation.notification_config?.channels || []).map((c: string) => (
                  <Badge key={c} variant="primary" size="sm">
                    {c}
                  </Badge>
                ))}
              </div>
              {!automation.notification_config?.approval_phone && (
                <p className="text-[11px] text-text-tertiary italic">
                  No notification phone configured
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfigRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-text-tertiary text-[11px] uppercase tracking-wider">{label}</span>
      <span className={cn('font-semibold text-text-primary', accent)}>{value}</span>
    </div>
  );
}
