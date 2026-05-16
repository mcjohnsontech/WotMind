'use client';

// Prevent static prerender for all pages in this route group.
// Next.js 16 + React 19 crashes with a null-dispatcher error on Netlify
// when statically pre-rendering client-component trees that include
// QueryClient or Supabase auth. force-dynamic makes every page here
// server-rendered on demand, which is correct for authenticated routes.
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Editor mode: fullscreen canvas, no topbar
  const isEditor =
    /^\/workflows\/[^/]+$/.test(pathname) && pathname !== '/workflows/new';

  return (
    <div className="flex h-[100dvh] bg-surface-0 overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0 w-full">
        {!isEditor && <Topbar onMenuOpen={() => setMobileOpen(true)} />}
        {isEditor && (
          // Render a minimal mobile-only top bar so the user can open nav on small screens
          <div className="lg:hidden flex items-center h-12 px-3 bg-surface-1/95 backdrop-blur-md border-b border-border shrink-0 z-10">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="p-2 rounded-md hover:bg-surface-2 text-text-secondary hover:text-text-primary transition-colors -ml-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
            <span className="ml-2 text-[13px] font-semibold text-text-primary">Editor</span>
          </div>
        )}
        <main
          id="main-content"
          className={`flex-1 bg-surface-0 ${isEditor ? 'overflow-hidden' : 'overflow-auto'}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
