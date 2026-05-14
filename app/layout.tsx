import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from '@/components/layout/providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Wotmind — Operational Intelligence',
  description:
    'AI-powered workflow orchestration platform for business automation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface-0">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
