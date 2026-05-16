'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const DISMISS_KEY = 'wm.setup-banner.dismissed';

export function SetupBanner() {
  const [missing, setMissing] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY) === '1') {
        setDismissed(true);
        return;
      }
    } catch {}

    const check = async () => {
      try {
        const res = await fetch('/api/setup/status');
        if (!res.ok) return;
        const data = await res.json();
        if (!data.ok && data.tables) {
          const m = Object.entries(data.tables)
            .filter(([, present]) => !present)
            .map(([name]) => name);
          setMissing(m);
        }
      } catch {
        // ignore
      }
    };
    check();
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {}
    setDismissed(true);
  };

  if (dismissed || missing.length === 0) return null;

  return (
    <div className="bg-accent-amber/10 border border-accent-amber/30 rounded-xl px-4 py-3 flex items-start gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-lg bg-accent-amber/20 border border-accent-amber/40 flex items-center justify-center shrink-0">
        <AlertTriangle className="w-4 h-4 text-accent-amber" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-text-primary">
          Finish your Supabase setup
        </p>
        <p className="text-[12px] text-text-secondary mt-0.5 leading-relaxed">
          {missing.length} required {missing.length === 1 ? 'table is' : 'tables are'} missing.
          Open <code className="bg-surface-2 px-1.5 py-0.5 rounded text-[11px] font-mono text-text-primary">supabase/schema.sql</code>{' '}
          and paste it into your Supabase SQL editor to enable workflows, automations, and audit logging.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {missing.slice(0, 8).map((t) => (
            <code
              key={t}
              className="text-[10px] font-mono text-accent-amber bg-accent-amber/15 px-1.5 py-0.5 rounded"
            >
              {t}
            </code>
          ))}
        </div>
        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-2 text-[12px] font-medium text-accent-primary hover:underline"
        >
          Open Supabase dashboard
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <button
        onClick={handleDismiss}
        className={cn(
          'p-1 rounded-md hover:bg-accent-amber/20 text-accent-amber/70 hover:text-accent-amber transition-colors shrink-0'
        )}
        title="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
