'use client';

import { useEffect, useState } from 'react';
import { Check, X, Loader2, RefreshCw, Send, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';

interface Check {
  service: string;
  ok: boolean;
  message: string;
  required_env: string[];
}

export function Diagnostics() {
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [sending, setSending] = useState<'sms' | 'whatsapp' | null>(null);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/diagnostics');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Diagnostics failed');
      setChecks(data.checks);
    } catch (e: any) {
      toast.error(e.message || 'Failed to run diagnostics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    run();
  }, []);

  const sendTest = async (channel: 'sms' | 'whatsapp') => {
    if (!testRecipient.trim()) {
      toast.error('Enter a phone number first');
      return;
    }
    setSending(channel);
    try {
      const res = await fetch('/api/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, recipient: testRecipient.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Send failed');
      toast.success(
        `${channel.toUpperCase()} sent · ID: ${data.external_id?.slice(0, 14)}…`,
        { duration: 5000 }
      );
    } catch (e: any) {
      toast.error(`${channel.toUpperCase()} failed: ${e.message}`, { duration: 7000 });
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Connection checks */}
      <div className="bg-surface-1 border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Connection status</h3>
            <p className="text-[12px] text-text-tertiary mt-0.5">
              Verifies your credentials reach each service. Does not send real messages or money.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={run} loading={loading}>
            <RefreshCw className="w-3.5 h-3.5" />
            Re-check
          </Button>
        </div>

        {checks === null && loading ? (
          <div className="flex items-center justify-center py-12 text-text-tertiary">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {checks?.map((c) => (
              <div
                key={c.service}
                className={cn(
                  'flex items-start gap-3 px-5 py-3.5',
                  !c.ok && 'bg-accent-red/[0.03]'
                )}
              >
                <div
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                    c.ok
                      ? 'bg-accent-green/15 text-accent-green'
                      : 'bg-accent-red/15 text-accent-red'
                  )}
                >
                  {c.ok ? (
                    <Check className="w-4 h-4" strokeWidth={3} />
                  ) : (
                    <X className="w-4 h-4" strokeWidth={3} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-semibold text-text-primary">{c.service}</p>
                    {!c.ok && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-accent-red bg-accent-red/10 px-1.5 py-0.5 rounded">
                        Not ready
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-text-secondary mt-0.5">{c.message}</p>
                  {!c.ok && (
                    <p className="text-[11px] text-text-tertiary mt-1 font-mono">
                      env: {c.required_env.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live send test */}
      <div className="bg-surface-1 border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-1">Send a real test message</h3>
        <p className="text-[12px] text-text-tertiary mb-4">
          Sends an actual SMS or WhatsApp message to the number below. Useful for confirming
          delivery end-to-end. Make sure the number is a Nigerian phone you control.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <Input
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              placeholder="+2348012345678"
              type="tel"
              inputMode="tel"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => sendTest('sms')}
              loading={sending === 'sms'}
              disabled={sending !== null}
            >
              <Send className="w-3.5 h-3.5" />
              Test SMS
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => sendTest('whatsapp')}
              loading={sending === 'whatsapp'}
              disabled={sending !== null}
            >
              <Send className="w-3.5 h-3.5" />
              Test WhatsApp
            </Button>
          </div>
        </div>

        <div className="mt-4 bg-accent-amber/5 border border-accent-amber/20 rounded-lg p-3 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-accent-amber shrink-0 mt-0.5" />
          <div className="text-[11px] text-text-secondary leading-relaxed">
            <p className="font-medium text-text-primary mb-0.5">Heads up on WhatsApp</p>
            <p>
              WhatsApp only allows freeform messages within 24 hours of a user messaging you. If
              you're testing for the first time, send a message to your WhatsApp Business number
              from this phone first, then come back here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
