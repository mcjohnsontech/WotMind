import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from '@/components/layout/providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Wotmind — AI Business Brain for Modern African Businesses',
    template: '%s · Wotmind',
  },
  description:
    'Wotmind transforms payment infrastructure into intelligent operational execution. Stop losing money to stockouts, fake reimbursements, payroll errors, and broken processes. Built on Squad.',
  keywords: [
    'AI automation',
    'business operations',
    'workflow automation',
    'fintech',
    'Squad payments',
    'Nigerian businesses',
    'MSME',
    'payroll automation',
    'expense management',
    'inventory management',
  ],
  authors: [{ name: 'Wotmind' }],
  creator: 'Wotmind',
  publisher: 'Wotmind',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: APP_URL,
    siteName: 'Wotmind',
    title: 'Wotmind — AI Business Brain',
    description:
      'AI-powered business orchestration for Nigerian MSMEs. Stop losing money to broken operations.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Wotmind — AI Business Brain',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wotmind — AI Business Brain',
    description:
      'AI-powered business orchestration for Nigerian MSMEs. Stop losing money to broken operations.',
    images: ['/og-image.png'],
    creator: '@wotmind',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0a0a0b' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0b' },
  ],
  colorScheme: 'dark',
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
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-surface-0">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
