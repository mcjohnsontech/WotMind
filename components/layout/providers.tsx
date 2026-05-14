'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#0d1117',
            color: '#e6edf3',
            border: '1px solid #21262d',
          },
        }}
      />
    </QueryClientProvider>
  );
}
