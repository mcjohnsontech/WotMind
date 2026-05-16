'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Send to your error monitoring (Sentry, etc.) in production.
    // For now, log locally.
    console.error('App error boundary:', error);
  }, [error]);

  return (
    <div className="min-h-[100dvh] bg-surface-0 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-accent-red/10 border border-accent-red/30 flex items-center justify-center mx-auto mb-5">
          <AlertOctagon className="w-7 h-7 text-accent-red" aria-hidden="true" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          Something went wrong
        </h1>
        <p className="text-text-secondary text-sm mb-6 leading-relaxed">
          We hit an unexpected error while loading this page. Our team has been notified.
          You can try again or head back to safety.
        </p>

        {error.digest && (
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-2 border border-border text-[11px] text-text-tertiary font-mono">
            <span>Error ID:</span>
            <code className="text-text-secondary">{error.digest}</code>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-2 justify-center">
          <Button variant="primary" size="md" onClick={() => reset()} className="w-full sm:w-auto">
            <RefreshCw className="w-3.5 h-3.5" />
            Try again
          </Button>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="secondary" size="md" className="w-full">
              <Home className="w-3.5 h-3.5" />
              Go to dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
