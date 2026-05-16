'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, ChevronRight, Plus, Activity, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './auth-provider';

const LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  workflows: 'Workflows',
  automations: 'Automations',
  payroll: 'Payroll',
  expenses: 'Expenses',
  inventory: 'Inventory',
  demo: 'Live Demo',
  audit: 'Audit Log',
  new: 'New',
};

interface TopbarProps {
  onMenuOpen?: () => void;
}

export function Topbar({ onMenuOpen }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const initial = (profile?.full_name?.[0] || user?.email?.[0] || 'W').toUpperCase();

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((seg, i) => {
      const label = LABELS[seg.toLowerCase()] || seg.replace(/-/g, ' ');
      const href = '/' + segments.slice(0, i + 1).join('/');
      return { label, href, active: i === segments.length - 1 };
    });
  };

  const crumbs = getBreadcrumbs();

  return (
    <header className="flex items-center justify-between h-[52px] px-3 sm:px-5 bg-surface-1/90 backdrop-blur-md border-b border-border shrink-0 z-10 gap-3">
      {/* Left: hamburger + breadcrumbs */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onMenuOpen}
          aria-label="Open menu"
          className="lg:hidden p-2 rounded-md hover:bg-surface-2 text-text-secondary hover:text-text-primary transition-colors -ml-1"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 min-w-0">
          {crumbs.length === 0 ? (
            <span className="text-[13px] font-semibold text-text-primary truncate">
              Dashboard
            </span>
          ) : (
            crumbs.map((crumb, idx) => (
              <div key={idx} className="flex items-center gap-1.5 min-w-0">
                {idx > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-text-tertiary shrink-0" aria-hidden="true" />
                )}
                {crumb.active ? (
                  <span className="text-[13px] font-semibold text-text-primary capitalize truncate">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-[13px] text-text-tertiary hover:text-text-primary transition-colors capitalize truncate hidden sm:inline"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          type="button"
          onClick={() => router.push('/workflows')}
          aria-label="Search workflows"
          className="hidden md:flex items-center gap-2 px-3 h-8 rounded-lg border border-border bg-surface-2/50 hover:bg-surface-2 hover:border-border/80 text-text-tertiary transition-colors w-44 xl:w-56"
        >
          <Search className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span className="text-[12px] flex-1 text-left truncate">Search…</span>
          <kbd className="text-[10px] text-text-tertiary bg-surface-0 px-1.5 py-0.5 rounded border border-border font-mono hidden xl:inline">
            ⌘K
          </kbd>
        </button>

        <Link
          href="/audit"
          className="hidden lg:flex items-center gap-1.5 px-2.5 h-8 rounded-lg bg-surface-2/50 hover:bg-surface-2 border border-border text-[11px] text-text-secondary hover:text-text-primary transition-colors"
        >
          <Activity className="w-3 h-3 text-accent-green" aria-hidden="true" />
          <span>Live</span>
        </Link>

        <Link href="/workflows/new" aria-label="Create new workflow">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-accent-primary text-text-inverse text-[12px] font-semibold hover:bg-accent-primary-hover transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
            <span className="hidden sm:inline">New</span>
          </button>
        </Link>

        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2 rounded-lg hover:bg-surface-2 transition-colors"
        >
          <Bell className="w-3.5 h-3.5 text-text-secondary" aria-hidden="true" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent-primary rounded-full" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            title={user?.email ?? undefined}
            aria-label="Account menu"
            aria-expanded={menuOpen}
            className="w-8 h-8 rounded-full bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center text-xs font-bold text-accent-primary hover:bg-accent-primary/30 transition-colors"
          >
            {initial}
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
              />
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 bg-surface-1 border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in"
              >
                <div className="px-3 py-2.5 border-b border-border-subtle">
                  <p className="text-[12px] font-semibold text-text-primary truncate">
                    {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-[11px] text-text-tertiary truncate">{user?.email}</p>
                  {profile?.business_name && (
                    <p className="text-[10px] text-text-tertiary mt-1 truncate">
                      {profile.business_name}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-accent-red hover:bg-accent-red-muted transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
