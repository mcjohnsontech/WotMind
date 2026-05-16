'use client';

export const dynamic = 'force-dynamic';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSupabaseClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Welcome back');
      router.push(next);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-0">
      {/* Left panel — Brand */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-surface-1 via-surface-1 to-surface-0 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 -left-20 w-96 h-96 rounded-full bg-accent-primary/20 blur-3xl" />
          <div className="absolute bottom-20 -right-20 w-96 h-96 rounded-full bg-accent-purple/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-accent-primary flex items-center justify-center shadow-lg shadow-accent-primary/30">
              <Sparkles className="w-4 h-4 text-text-inverse" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight">Wotmind</span>
          </Link>

          <div className="space-y-6 max-w-md">
            <h2 className="text-4xl font-bold tracking-tight leading-tight">
              Automate your business with{' '}
              <span className="text-gradient">a single prompt</span>
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Describe what you want to automate in plain English. Wotmind designs the workflow,
              runs AI checks, and orchestrates payouts via Squad — all in real-time.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-4">
              {[
                { label: 'AI Workflow Builder', detail: 'Gemini-powered' },
                { label: 'Squad Transfers', detail: 'NGN payouts' },
                { label: 'SMS Approvals', detail: 'Twilio + WhatsApp' },
                { label: 'Audit Trail', detail: 'Immutable logs' },
              ].map((f) => (
                <div
                  key={f.label}
                  className="bg-surface-2/50 border border-border rounded-xl p-3 backdrop-blur-sm"
                >
                  <p className="text-xs font-semibold text-text-primary">{f.label}</p>
                  <p className="text-[10px] text-text-tertiary mt-0.5">{f.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-text-tertiary">
            © 2026 Wotmind · For Nigerian businesses
          </p>
        </div>
      </div>

      {/* Right panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm space-y-8 animate-fade-in">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-lg bg-accent-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-text-inverse" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-tight">Wotmind</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-text-secondary">
              Sign in to continue automating
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-text-tertiary uppercase tracking-widest block mb-1.5">
                Email
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                icon={<Mail className="w-3.5 h-3.5" />}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-text-tertiary uppercase tracking-widest">
                  Password
                </label>
                <Link
                  href="#"
                  className="text-[11px] text-text-tertiary hover:text-accent-primary transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                icon={<Lock className="w-3.5 h-3.5" />}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={isLoading}
              size="md"
            >
              Sign in
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface-0 px-3 text-text-tertiary">or</span>
            </div>
          </div>

          <Link href="/signup">
            <Button variant="outline" className="w-full">
              Create a free account
            </Button>
          </Link>

          <p className="text-center text-[11px] text-text-tertiary">
            By signing in you agree to our{' '}
            <a href="#" className="text-text-secondary hover:text-accent-primary">
              Terms
            </a>{' '}
            and{' '}
            <a href="#" className="text-text-secondary hover:text-accent-primary">
              Privacy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
