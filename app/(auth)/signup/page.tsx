'use client';

export const dynamic = 'force-dynamic';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSupabaseClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import {
  Sparkles,
  Mail,
  Lock,
  User as UserIcon,
  Building2,
  ArrowRight,
  Check,
} from 'lucide-react';

function SignupInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/dashboard';

  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const passwordStrength = (() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            business_name: businessName || null,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      // If session was returned, user is immediately signed in (email confirmation disabled)
      if (data.session) {
        // Best-effort: update profile with business name now that session exists
        if (businessName) {
          try {
            await supabase
              .from('profiles')
              .update({ business_name: businessName, full_name: fullName })
              .eq('id', data.user!.id);
          } catch {
            // trigger may not have fired yet — ignore
          }
        }

        toast.success('Welcome to Wotmind!');
        router.push(next);
        router.refresh();
      } else {
        toast.success('Check your email to confirm your account');
        router.push('/login');
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not create account. Try again.');
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
              Start automating your business{' '}
              <span className="text-gradient">in 60 seconds</span>
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Free to start. No credit card. Connect Squad, plug in your Twilio, and ship your first
              automation today.
            </p>

            <ul className="space-y-3">
              {[
                'AI-built workflows from plain English',
                'Squad transfers + SMS approvals',
                'Real-time execution monitoring',
                'Immutable audit trail',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-text-secondary">
                  <div className="w-5 h-5 rounded-full bg-accent-green/15 border border-accent-green/30 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-accent-green" strokeWidth={3} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-text-tertiary">
            © 2026 Wotmind · For Nigerian businesses
          </p>
        </div>
      </div>

      {/* Right panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-sm space-y-6 animate-fade-in py-6">
          <div className="lg:hidden flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-lg bg-accent-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-text-inverse" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-tight">Wotmind</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Create your account
            </h1>
            <p className="text-sm text-text-secondary">
              Free forever for your first 100 runs
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-semibold text-text-tertiary uppercase tracking-widest block mb-1.5">
                Full name
              </label>
              <Input
                type="text"
                placeholder="Adaeze Okonkwo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
                required
                icon={<UserIcon className="w-3.5 h-3.5" />}
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-text-tertiary uppercase tracking-widest block mb-1.5">
                Business name{' '}
                <span className="text-text-tertiary normal-case font-normal">(optional)</span>
              </label>
              <Input
                type="text"
                placeholder="Acme Stores Ltd"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                disabled={isLoading}
                icon={<Building2 className="w-3.5 h-3.5" />}
              />
            </div>

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
              <label className="text-[11px] font-semibold text-text-tertiary uppercase tracking-widest block mb-1.5">
                Password
              </label>
              <Input
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                minLength={8}
                icon={<Lock className="w-3.5 h-3.5" />}
              />
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength >= step
                          ? passwordStrength <= 2
                            ? 'bg-accent-red'
                            : passwordStrength === 3
                              ? 'bg-accent-amber'
                              : 'bg-accent-green'
                          : 'bg-surface-3'
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-text-tertiary ml-1 min-w-12">
                    {passwordStrength <= 2
                      ? 'Weak'
                      : passwordStrength === 3
                        ? 'Okay'
                        : 'Strong'}
                  </span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={isLoading}
              size="md"
            >
              Create account
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </form>

          <p className="text-center text-[12px] text-text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="text-accent-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>

          <p className="text-center text-[11px] text-text-tertiary">
            By signing up you agree to our{' '}
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

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupInner />
    </Suspense>
  );
}
