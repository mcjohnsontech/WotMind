'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2, Sparkles, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';

interface ModelEntry {
  provider: 'gemini' | 'openrouter';
  id: string;
  label: string;
  description: string;
  tier: 'free' | 'cheap' | 'premium';
  vision: boolean;
  contextLength: number;
}

interface Settings {
  preferred_provider: 'gemini' | 'openrouter';
  preferred_model: string;
  fallback_chain: { provider: 'gemini' | 'openrouter'; model: string }[];
  monthly_token_budget: number | null;
  tokens_used_this_month: number;
  usage_reset_at: string | null;
}

const TIER_META: Record<ModelEntry['tier'], { label: string; icon: React.ElementType; variant: 'success' | 'info' | 'primary' }> = {
  free: { label: 'Free', icon: Sparkles, variant: 'success' },
  cheap: { label: 'Budget', icon: Zap, variant: 'info' },
  premium: { label: 'Premium', icon: Crown, variant: 'primary' },
};

export function ModelPicker() {
  const [models, setModels] = useState<ModelEntry[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        const [modelsRes, settingsRes] = await Promise.all([
          fetch('/api/ai/models'),
          fetch('/api/user/ai-settings'),
        ]);
        const m = await modelsRes.json();
        const s = await settingsRes.json();
        setModels(m.models || []);
        setSettings(s.settings);
        setBudgetDraft(s.settings?.monthly_token_budget?.toString() ?? '');
      } catch (e) {
        toast.error('Failed to load AI settings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateSettings = async (patch: Partial<Settings>) => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch('/api/user/ai-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSettings(data.settings);
      toast.success('Saved');
    } catch (e: any) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const selectModel = (m: ModelEntry) => {
    updateSettings({ preferred_provider: m.provider, preferred_model: m.id });
  };

  const saveBudget = () => {
    const parsed = budgetDraft.trim() === '' ? null : parseInt(budgetDraft, 10);
    if (parsed != null && (Number.isNaN(parsed) || parsed < 0)) {
      toast.error('Budget must be a positive number');
      return;
    }
    updateSettings({ monthly_token_budget: parsed });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-text-tertiary">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  if (!settings) return null;

  const usagePct = settings.monthly_token_budget
    ? Math.min(100, (settings.tokens_used_this_month / settings.monthly_token_budget) * 100)
    : null;

  return (
    <div className="space-y-8">
      {/* Usage card */}
      <div className="bg-surface-1 border border-border rounded-xl p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">This month's usage</h3>
            <p className="text-xs text-text-tertiary mt-0.5">
              When you hit your budget, requests automatically fall back to a backup model so nothing breaks.
            </p>
          </div>
          <span className="text-lg font-bold text-text-primary tabular-nums">
            {settings.tokens_used_this_month.toLocaleString()}
            {settings.monthly_token_budget != null && (
              <span className="text-text-tertiary text-sm font-normal">
                {' '}/ {settings.monthly_token_budget.toLocaleString()}
              </span>
            )}
            <span className="text-text-tertiary text-xs font-normal"> tokens</span>
          </span>
        </div>

        {usagePct != null && (
          <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all',
                usagePct >= 90 ? 'bg-accent-red' : usagePct >= 70 ? 'bg-accent-amber' : 'bg-accent-green'
              )}
              style={{ width: `${usagePct}%` }}
            />
          </div>
        )}

        <div className="mt-4 flex items-end gap-2">
          <div className="flex-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary block mb-1">
              Monthly token budget (leave blank for unlimited)
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={budgetDraft}
              onChange={(e) => setBudgetDraft(e.target.value)}
              placeholder="e.g. 500000"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
            />
          </div>
          <Button variant="secondary" size="md" onClick={saveBudget} loading={saving}>
            Update
          </Button>
        </div>
      </div>

      {/* Model picker */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-1">Preferred model</h3>
        <p className="text-xs text-text-tertiary mb-4">
          Used for receipt OCR and AI extraction across all your automations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {models.map((model) => {
            const selected =
              settings.preferred_provider === model.provider &&
              settings.preferred_model === model.id;
            const tier = TIER_META[model.tier];
            const TierIcon = tier.icon;

            return (
              <button
                key={`${model.provider}:${model.id}`}
                type="button"
                onClick={() => selectModel(model)}
                disabled={saving}
                className={cn(
                  'text-left bg-surface-1 border rounded-xl p-4 transition-all hover:border-accent-primary/40 disabled:opacity-60 disabled:cursor-wait',
                  selected ? 'border-accent-primary ring-1 ring-accent-primary/40' : 'border-border'
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <h4 className="text-sm font-semibold text-text-primary truncate">{model.label}</h4>
                    {selected && (
                      <Check className="w-4 h-4 text-accent-primary shrink-0" strokeWidth={3} />
                    )}
                  </div>
                  <Badge variant={tier.variant} size="sm">
                    <TierIcon className="w-2.5 h-2.5" />
                    {tier.label}
                  </Badge>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed mb-2">
                  {model.description}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-text-tertiary uppercase tracking-wider">
                  <span>{model.provider}</span>
                  <span>·</span>
                  <span>{(model.contextLength / 1000).toFixed(0)}k context</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
