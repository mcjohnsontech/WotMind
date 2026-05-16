'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Receipt,
  Users,
  FileText,
  Package,
  Image as ImageIcon,
  Building2,
  CreditCard,
  Sparkles,
  Phone,
  MessageSquare,
  Bell,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import type { AutomationType } from '@/types/automation';

interface UseCase {
  type: AutomationType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  defaultName: string;
}

const USE_CASES: UseCase[] = [
  {
    type: 'receipt_reimbursement',
    title: 'Receipt Reimbursement',
    description: 'OCR fuel/expense receipts and reimburse staff automatically',
    icon: Receipt,
    badge: 'Demo Ready',
    defaultName: 'Receipt Reimbursement',
  },
  {
    type: 'payroll',
    title: 'Payroll',
    description: 'Pay staff salaries monthly via Squad with AI risk checks',
    icon: Users,
    badge: 'Most Popular',
    defaultName: 'Monthly Payroll',
  },
  {
    type: 'expense',
    title: 'Expense Approval',
    description: 'Staff submit expenses, AI scores, manager approves by SMS',
    icon: FileText,
    defaultName: 'Expense Approval',
  },
  {
    type: 'invoice',
    title: 'Invoice Payment',
    description: 'Auto-pay vendor invoices before due date with verification',
    icon: FileText,
    defaultName: 'Invoice Payment',
  },
  {
    type: 'inventory',
    title: 'Inventory Reorder',
    description: 'Track stock, alert when low, generate purchase orders',
    icon: Package,
    defaultName: 'Inventory Reorder',
  },
  {
    type: 'batch_design',
    title: 'Batch Design',
    description: 'Upload images, AI generates labeled marketing designs',
    icon: ImageIcon,
    defaultName: 'Batch Design',
  },
  {
    type: 'vendor_payment',
    title: 'Vendor Payouts',
    description: 'Schedule recurring payouts to your vendor list',
    icon: Building2,
    defaultName: 'Vendor Payouts',
  },
  {
    type: 'salary_advance',
    title: 'Salary Advance',
    description: 'Staff request advance, AI reviews, auto-deduct from salary',
    icon: CreditCard,
    defaultName: 'Salary Advance',
  },
];

interface FormState {
  type: AutomationType | null;
  name: string;
  description: string;
  ai_rules: {
    auto_approve_below: number;
    require_approval_above: number;
    max_amount: number;
    anomaly_score_threshold: number;
  };
  notification_config: {
    approval_phone: string;
    notify_on_complete: string;
    channels: string[];
    whatsapp_enabled: boolean;
  };
}

const STEPS = ['Use Case', 'Details', 'AI Rules', 'Notifications', 'Review'] as const;

export default function NewAutomationPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>({
    type: null,
    name: '',
    description: '',
    ai_rules: {
      auto_approve_below: 10000,
      require_approval_above: 100000,
      max_amount: 500000,
      anomaly_score_threshold: 70,
    },
    notification_config: {
      approval_phone: '',
      notify_on_complete: '',
      channels: ['sms'],
      whatsapp_enabled: false,
    },
  });

  const canNext = (() => {
    if (step === 0) return form.type !== null;
    if (step === 1) return form.name.trim().length > 1;
    return true;
  })();

  const handleNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handlePickType = (type: AutomationType) => {
    const useCase = USE_CASES.find((u) => u.type === type);
    setForm((f) => ({
      ...f,
      type,
      name: f.name || useCase?.defaultName || '',
      description: f.description || useCase?.description || '',
    }));
    setTimeout(handleNext, 200);
  };

  const handleSubmit = async () => {
    if (!form.type) {
      toast.error('Pick a use case');
      setStep(0);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          automation_type: form.type,
          config: { description: form.description },
          ai_rules: form.ai_rules,
          notification_config: form.notification_config,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to create automation');
      }
      const data = await res.json();
      toast.success('Automation created');
      router.push(`/automations/${data.automation.id}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Could not create automation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-surface-0">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 animate-fade-in">
          <Link
            href="/automations"
            className="p-1.5 rounded-lg hover:bg-surface-2 text-text-tertiary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">
              Create Automation
            </h1>
            <p className="text-[12px] text-text-tertiary">
              Step {step + 1} of {STEPS.length} · {STEPS[step]}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1 sm:gap-1.5 mb-6 sm:mb-8 animate-fade-in">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col gap-1.5 min-w-0">
              <div
                className={cn(
                  'h-1 rounded-full transition-all duration-300',
                  i < step
                    ? 'bg-accent-green'
                    : i === step
                      ? 'bg-accent-primary'
                      : 'bg-surface-3'
                )}
              />
              <span
                className={cn(
                  'text-[9px] sm:text-[10px] font-medium uppercase tracking-wider truncate',
                  i === step
                    ? 'text-accent-primary'
                    : i < step
                      ? 'text-accent-green'
                      : 'text-text-tertiary'
                )}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="min-h-[400px]"
          >
            {/* Step 0: Use Case */}
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-semibold text-text-primary mb-1">
                    What do you want to automate?
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Pick a starting point. You can customize everything next.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {USE_CASES.map((u) => {
                    const Icon = u.icon;
                    const isSelected = form.type === u.type;
                    return (
                      <button
                        key={u.type}
                        onClick={() => handlePickType(u.type)}
                        className={cn(
                          'text-left p-4 rounded-xl border transition-all group relative',
                          isSelected
                            ? 'bg-accent-primary/10 border-accent-primary ring-2 ring-accent-primary/30'
                            : 'bg-surface-1 border-border hover:border-accent-primary/30 hover:shadow-md'
                        )}
                      >
                        {u.badge && (
                          <span className="absolute top-2.5 right-2.5 text-[9px] font-semibold uppercase tracking-wider bg-accent-primary/10 text-accent-primary px-1.5 py-0.5 rounded">
                            {u.badge}
                          </span>
                        )}
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                              isSelected
                                ? 'bg-accent-primary/20'
                                : 'bg-surface-2 group-hover:bg-accent-primary/10'
                            )}
                          >
                            <Icon
                              className={cn(
                                'w-4 h-4',
                                isSelected ? 'text-accent-primary' : 'text-text-secondary'
                              )}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold text-text-primary mb-0.5">
                              {u.title}
                            </p>
                            <p className="text-[11px] text-text-tertiary leading-relaxed">
                              {u.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 1: Details */}
            {step === 1 && (
              <div className="space-y-5 max-w-lg">
                <div>
                  <h2 className="text-base font-semibold text-text-primary mb-1">
                    Name your automation
                  </h2>
                  <p className="text-sm text-text-secondary">
                    A short, descriptive name helps you find it later.
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-text-tertiary uppercase tracking-widest block mb-1.5">
                    Name
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Monthly fuel reimbursement"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-text-tertiary uppercase tracking-widest block mb-1.5">
                    Description{' '}
                    <span className="text-text-tertiary normal-case font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="What does this automation do?"
                    rows={3}
                    className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all resize-y"
                  />
                </div>
              </div>
            )}

            {/* Step 2: AI Rules */}
            {step === 2 && (
              <div className="space-y-5 max-w-2xl">
                <div>
                  <h2 className="text-base font-semibold text-text-primary mb-1">
                    AI risk rules
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Wotmind&apos;s AI engine uses these thresholds to decide what to auto-approve
                    versus what to escalate to you.
                  </p>
                </div>

                <div className="bg-surface-1 border border-border rounded-xl p-5 space-y-5">
                  <CurrencyField
                    label="Auto-approve below"
                    description="Amounts below this run without approval"
                    value={form.ai_rules.auto_approve_below}
                    onChange={(v) =>
                      setForm({
                        ...form,
                        ai_rules: { ...form.ai_rules, auto_approve_below: v },
                      })
                    }
                    accent="text-accent-green"
                  />
                  <CurrencyField
                    label="Require approval above"
                    description="Amounts above this require SMS approval"
                    value={form.ai_rules.require_approval_above}
                    onChange={(v) =>
                      setForm({
                        ...form,
                        ai_rules: { ...form.ai_rules, require_approval_above: v },
                      })
                    }
                    accent="text-accent-amber"
                  />
                  <CurrencyField
                    label="Hard cap"
                    description="No transaction above this amount will ever run"
                    value={form.ai_rules.max_amount}
                    onChange={(v) =>
                      setForm({
                        ...form,
                        ai_rules: { ...form.ai_rules, max_amount: v },
                      })
                    }
                    accent="text-accent-red"
                  />

                  <div>
                    <label className="text-[11px] font-semibold text-text-tertiary uppercase tracking-widest block mb-1.5">
                      Anomaly Threshold ({form.ai_rules.anomaly_score_threshold}%)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={form.ai_rules.anomaly_score_threshold}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          ai_rules: {
                            ...form.ai_rules,
                            anomaly_score_threshold: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-accent-primary"
                    />
                    <p className="text-[11px] text-text-tertiary mt-1">
                      Higher risk scores than this require approval
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Notifications */}
            {step === 3 && (
              <div className="space-y-5 max-w-2xl">
                <div>
                  <h2 className="text-base font-semibold text-text-primary mb-1">
                    Notifications
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Where should approval requests and completion alerts go?
                  </p>
                </div>

                <div className="bg-surface-1 border border-border rounded-xl p-5 space-y-5">
                  <div>
                    <label className="text-[11px] font-semibold text-text-tertiary uppercase tracking-widest block mb-1.5">
                      Approval Phone
                    </label>
                    <Input
                      value={form.notification_config.approval_phone}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          notification_config: {
                            ...form.notification_config,
                            approval_phone: e.target.value,
                          },
                        })
                      }
                      placeholder="+2348012345678"
                      icon={<Phone className="w-3.5 h-3.5" />}
                    />
                    <p className="text-[11px] text-text-tertiary mt-1">
                      Approvals sent here as SMS — reply YES-CODE or NO-CODE
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-text-tertiary uppercase tracking-widest block mb-1.5">
                      Completion Notifications
                    </label>
                    <Input
                      value={form.notification_config.notify_on_complete}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          notification_config: {
                            ...form.notification_config,
                            notify_on_complete: e.target.value,
                          },
                        })
                      }
                      placeholder="+2348012345678 (optional)"
                      icon={<Bell className="w-3.5 h-3.5" />}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-text-tertiary uppercase tracking-widest block mb-2">
                      Channels
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'sms', label: 'SMS', icon: MessageSquare },
                        { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                        { id: 'email', label: 'Email', icon: Mail },
                      ].map((c) => {
                        const Icon = c.icon;
                        const enabled = form.notification_config.channels.includes(c.id);
                        return (
                          <button
                            key={c.id}
                            onClick={() => {
                              const channels = enabled
                                ? form.notification_config.channels.filter((x) => x !== c.id)
                                : [...form.notification_config.channels, c.id];
                              setForm({
                                ...form,
                                notification_config: {
                                  ...form.notification_config,
                                  channels,
                                  whatsapp_enabled: channels.includes('whatsapp'),
                                },
                              });
                            }}
                            className={cn(
                              'flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all',
                              enabled
                                ? 'bg-accent-primary/10 border-accent-primary text-accent-primary'
                                : 'bg-surface-2 border-border text-text-secondary hover:border-text-tertiary'
                            )}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-[12px] font-medium">{c.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-5 max-w-2xl">
                <div>
                  <h2 className="text-base font-semibold text-text-primary mb-1">
                    Review and create
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Looks good? Create the automation and start running.
                  </p>
                </div>

                <div className="bg-surface-1 border border-border rounded-xl divide-y divide-border-subtle">
                  <ReviewRow label="Use case">
                    <span className="capitalize">{form.type?.replace(/_/g, ' ')}</span>
                  </ReviewRow>
                  <ReviewRow label="Name">{form.name}</ReviewRow>
                  {form.description && (
                    <ReviewRow label="Description">{form.description}</ReviewRow>
                  )}
                  <ReviewRow label="Auto-approve">
                    ₦{form.ai_rules.auto_approve_below.toLocaleString()} and below
                  </ReviewRow>
                  <ReviewRow label="Require approval">
                    ₦{form.ai_rules.require_approval_above.toLocaleString()} and above
                  </ReviewRow>
                  <ReviewRow label="Hard cap">
                    ₦{form.ai_rules.max_amount.toLocaleString()}
                  </ReviewRow>
                  <ReviewRow label="Anomaly threshold">
                    {form.ai_rules.anomaly_score_threshold}%
                  </ReviewRow>
                  {form.notification_config.approval_phone && (
                    <ReviewRow label="Approval phone">
                      {form.notification_config.approval_phone}
                    </ReviewRow>
                  )}
                  <ReviewRow label="Channels">
                    <div className="flex flex-wrap gap-1">
                      {form.notification_config.channels.map((c) => (
                        <Badge key={c} variant="primary" size="sm">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </ReviewRow>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-border-subtle">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/automations')}
            disabled={submitting}
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button variant="secondary" size="sm" onClick={handleBack} disabled={submitting}>
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleNext}
                disabled={!canNext || submitting}
              >
                Next
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                loading={submitting}
                disabled={!form.type || !form.name.trim()}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Create automation
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CurrencyField({
  label,
  description,
  value,
  onChange,
  accent,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
  accent: string;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-text-tertiary uppercase tracking-widest block mb-1.5">
        {label}
      </label>
      <div className="relative">
        <span
          className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold',
            accent
          )}
        >
          ₦
        </span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full bg-surface-2 border border-border rounded-lg pl-7 pr-3 py-2 text-[13px] text-text-primary outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all"
        />
      </div>
      <p className="text-[11px] text-text-tertiary mt-1">{description}</p>
    </div>
  );
}

function ReviewRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3">
      <span className="text-[12px] text-text-tertiary uppercase tracking-wider font-medium">
        {label}
      </span>
      <span className="text-[13px] text-text-primary font-medium text-right">{children}</span>
    </div>
  );
}
