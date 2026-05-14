'use client';

import { usePathname } from 'next/navigation';

export function Topbar() {
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/demo') return 'Live Demo';
    if (pathname === '/workflows') return 'Workflows';
    if (pathname === '/audit') return 'Audit Log';
    if (pathname.includes('/workflows/')) return 'Workflow Canvas';
    return 'Wotmind';
  };

  return (
    <div className="flex items-center justify-between h-16 px-6 bg-surface-1 border-b border-border">
      <h1 className="text-lg font-semibold text-text-primary">
        {getTitle()}
      </h1>
    </div>
  );
}
