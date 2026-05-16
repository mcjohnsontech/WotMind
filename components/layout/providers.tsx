'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ReactNode, useState } from 'react';
import { AuthProvider } from './auth-provider';

export function Providers({ children }: { children: ReactNode }) {
  // QueryClient must be inside useState — creating it at module level causes
  // the React dispatcher to be null during Next.js 16 static prerender.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--surface-2)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            fontSize: '13px',
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          },
          success: {
            iconTheme: {
              primary: 'var(--accent-green)',
              secondary: 'var(--surface-2)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--accent-red)',
              secondary: 'var(--surface-2)',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}
