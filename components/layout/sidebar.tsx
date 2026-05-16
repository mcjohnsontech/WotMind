'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Workflow,
  Zap,
  Users,
  Receipt,
  Package,
  Activity,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  HelpCircle,
  Sparkles,
  Plus,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useState, useEffect } from 'react';
import { useAuth } from './auth-provider';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    title: 'Build',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
      { href: '/workflows', label: 'Workflows', icon: Workflow },
      { href: '/automations', label: 'Automations', icon: Zap },
    ],
  },
  {
    title: 'Use Cases',
    items: [
      { href: '/payroll', label: 'Payroll', icon: Users },
      { href: '/expenses', label: 'Expenses', icon: Receipt },
      { href: '/inventory', label: 'Inventory', icon: Package },
    ],
  },
  {
    title: 'Observability',
    items: [
      { href: '/demo', label: 'Live Demo', icon: Activity },
      { href: '/audit', label: 'Audit Log', icon: Shield },
    ],
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { signOut, profile, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('wm.sidebar.collapsed');
      if (stored) setCollapsed(stored === '1');
    } catch {}
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    onMobileClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [mobileOpen]);

  const setCollapsedPersist = (v: boolean) => {
    setCollapsed(v);
    try {
      localStorage.setItem('wm.sidebar.collapsed', v ? '1' : '0');
    } catch {}
  };

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'));

  const handleLogout = () => signOut();

  const initial = (profile?.full_name?.[0] || user?.email?.[0] || 'W').toUpperCase();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'flex flex-col bg-surface-1 border-r border-border shrink-0 z-50',
          // Mobile: fixed drawer
          'fixed inset-y-0 left-0 h-screen w-[260px] transition-transform duration-200 ease-out',
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
          // Desktop: static sidebar
          'lg:relative lg:translate-x-0 lg:shadow-none lg:transition-[width]',
          collapsed ? 'lg:w-[60px]' : 'lg:w-[232px]'
        )}
        aria-label="Primary navigation"
      >
        {/* Logo + close button (mobile) */}
        <div className="flex items-center h-[52px] px-3 border-b border-border shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5 group" onClick={onMobileClose}>
            <div className="w-7 h-7 rounded-md bg-accent-primary flex items-center justify-center shrink-0 shadow-md group-hover:shadow-[0_0_18px_rgba(255,109,90,0.5)] transition-shadow">
              <Sparkles className="w-3.5 h-3.5 text-text-inverse" strokeWidth={2.5} />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="flex items-center gap-1.5 animate-fade-in">
                <span className="text-[15px] font-bold text-text-primary tracking-tight">
                  Wotmind
                </span>
                <span className="text-[9px] font-semibold text-text-tertiary uppercase tracking-widest bg-surface-3 px-1.5 py-0.5 rounded">
                  Beta
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={onMobileClose}
            className="ml-auto p-1.5 rounded-md hover:bg-surface-2 text-text-tertiary hover:text-text-primary transition-colors lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Workflow CTA */}
        <div className="px-2 pt-2 pb-1">
          <Link
            href="/workflows/new"
            onClick={onMobileClose}
            className={cn(
              'flex items-center gap-2 rounded-lg text-[12px] font-semibold transition-all',
              'bg-accent-primary text-text-inverse hover:bg-accent-primary-hover shadow-sm',
              !mobileOpen && collapsed
                ? 'lg:justify-center lg:w-9 lg:h-9 lg:mx-auto px-3 py-2'
                : 'px-3 py-2'
            )}
            title={!mobileOpen && collapsed ? 'New Workflow' : undefined}
          >
            <Plus className="w-3.5 h-3.5 shrink-0" strokeWidth={3} />
            {(!collapsed || mobileOpen) && <span>New Workflow</span>}
          </Link>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 overflow-y-auto py-3 px-2 space-y-3"
          aria-label="App sections"
        >
          {sections.map((section) => (
            <div key={section.title}>
              {(!collapsed || mobileOpen) && (
                <p className="px-3 mb-1 text-[10px] font-semibold text-text-tertiary uppercase tracking-widest">
                  {section.title}
                </p>
              )}
              <div className="space-y-px">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onMobileClose}
                      title={!mobileOpen && collapsed ? item.label : undefined}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-2.5 rounded-md text-[12.5px] font-medium transition-colors duration-100 group relative',
                        !mobileOpen && collapsed
                          ? 'lg:justify-center lg:w-9 lg:h-9 lg:mx-auto px-3 py-2'
                          : 'px-3 py-2 lg:py-1.5',
                        active
                          ? 'bg-accent-primary/10 text-accent-primary'
                          : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                      )}
                    >
                      {active && (!collapsed || mobileOpen) && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-accent-primary rounded-r-full" />
                      )}
                      <Icon
                        className={cn(
                          'w-[16px] h-[16px] shrink-0',
                          active ? 'text-accent-primary' : 'text-text-tertiary group-hover:text-text-secondary'
                        )}
                        aria-hidden="true"
                      />
                      {(!collapsed || mobileOpen) && (
                        <>
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto text-[9px] font-semibold uppercase bg-accent-primary/15 text-accent-primary px-1.5 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User card (mobile only — shows in drawer) */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border px-3 py-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center text-sm font-bold text-accent-primary shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-text-primary truncate">
                {profile?.full_name || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-[11px] text-text-tertiary truncate">{user?.email}</p>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="border-t border-border px-2 py-2 space-y-px">
          <button
            type="button"
            className={cn(
              'flex items-center gap-2.5 rounded-md text-[12.5px] font-medium text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors w-full',
              !mobileOpen && collapsed
                ? 'lg:justify-center lg:w-9 lg:h-9 lg:mx-auto px-3 py-2'
                : 'px-3 py-2 lg:py-1.5'
            )}
            title={!mobileOpen && collapsed ? 'Settings' : undefined}
          >
            <Settings className="w-[16px] h-[16px] shrink-0 text-text-tertiary" aria-hidden="true" />
            {(!collapsed || mobileOpen) && <span>Settings</span>}
          </button>
          <a
            href="https://github.com/anthropics/claude-code"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center gap-2.5 rounded-md text-[12.5px] font-medium text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors w-full',
              !mobileOpen && collapsed
                ? 'lg:justify-center lg:w-9 lg:h-9 lg:mx-auto px-3 py-2'
                : 'px-3 py-2 lg:py-1.5'
            )}
            title={!mobileOpen && collapsed ? 'Help' : undefined}
          >
            <HelpCircle className="w-[16px] h-[16px] shrink-0 text-text-tertiary" aria-hidden="true" />
            {(!collapsed || mobileOpen) && <span>Help</span>}
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-2.5 rounded-md text-[12.5px] font-medium text-accent-red/80 hover:bg-accent-red-muted hover:text-accent-red transition-colors w-full',
              !mobileOpen && collapsed
                ? 'lg:justify-center lg:w-9 lg:h-9 lg:mx-auto px-3 py-2'
                : 'px-3 py-2 lg:py-1.5'
            )}
            title={!mobileOpen && collapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-[16px] h-[16px] shrink-0" aria-hidden="true" />
            {(!collapsed || mobileOpen) && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse Toggle (desktop only) */}
        <button
          type="button"
          onClick={() => setCollapsedPersist(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden lg:flex absolute -right-3 top-[60px] w-6 h-6 rounded-full bg-surface-2 border border-border items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-3 transition-colors z-10 shadow"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </aside>
    </>
  );
}
