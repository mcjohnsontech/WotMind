'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global root error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: '#0a0a0b',
          color: '#f0f0f2',
          minHeight: '100vh',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div style={{ maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>
            We hit a wall
          </h1>
          <p style={{ color: '#8e8e96', fontSize: '14px', margin: '0 0 24px' }}>
            A critical error broke the page. Try refreshing or come back shortly.
          </p>
          {error.digest && (
            <p
              style={{
                display: 'inline-block',
                background: '#1a1a1e',
                border: '1px solid #2a2a30',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#8e8e96',
                marginBottom: '20px',
                fontFamily: 'monospace',
              }}
            >
              Error ID: {error.digest}
            </p>
          )}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                background: '#ff6d5a',
                color: '#0a0a0b',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 18px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                background: '#1a1a1e',
                color: '#f0f0f2',
                border: '1px solid #2a2a30',
                borderRadius: '8px',
                padding: '10px 18px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
