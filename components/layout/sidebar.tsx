'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, LayoutGrid, Workflow, LogOut } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/demo', label: 'Live Demo', icon: Activity },
    { href: '/workflows', label: 'Workflows', icon: Workflow },
    { href: '/audit', label: 'Audit Log', icon: Activity },
  ];

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col h-screen w-64 bg-surface-1 border-r border-border">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-border-glow">Wotmind</h1>
        <p className="text-xs text-text-secondary mt-1">
          Operational Intelligence
        </p>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-surface-2 text-border-glow'
                  : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start gap-2 text-accent-red hover:text-accent-red"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
