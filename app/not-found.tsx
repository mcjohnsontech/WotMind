import Link from 'next/link';
import { ArrowLeft, Search, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-surface-0 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center animate-fade-in">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center shadow-lg shadow-accent-primary/30">
            <Sparkles className="w-4 h-4 text-text-inverse" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight">Wotmind</span>
        </Link>

        <p className="text-[120px] sm:text-[160px] font-bold tracking-tighter leading-none text-gradient mb-2">
          404
        </p>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          Page not found
        </h1>
        <p className="text-text-secondary text-sm mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get
          you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-2 justify-center">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 h-10 rounded-lg bg-accent-primary text-text-inverse text-sm font-semibold hover:bg-accent-primary-hover transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Go to dashboard
          </Link>
          <Link
            href="/workflows"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 h-10 rounded-lg bg-surface-1 border border-border text-sm font-semibold hover:border-text-tertiary transition-colors"
          >
            <Search className="w-3.5 h-3.5" aria-hidden="true" />
            Browse workflows
          </Link>
        </div>
      </div>
    </div>
  );
}
