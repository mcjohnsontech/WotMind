import type { Metadata } from 'next';
import { Landing } from '@/components/landing/landing';

// This page is intentionally a Server Component. The landing UI is a Client
// Component (components/landing/landing.tsx) — this wrapper exists so we can
// still export `metadata` at the route level. Marking the page itself as
// "use client" prevents page-level metadata and trips a Next 16 + React 19
// prerender edge case on Netlify; this split avoids both.
export const metadata: Metadata = {
  title: 'Wotmind — AI Business Brain for Modern African Businesses',
  description:
    'Wotmind transforms payment infrastructure into intelligent operational execution. Stop losing money to stockouts, fake reimbursements, payroll errors, and broken processes.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Wotmind — AI Business Brain',
    description:
      'AI-powered business orchestration for Nigerian MSMEs. Stop losing money to broken operations.',
    url: '/',
  },
};

export default function HomePage() {
  return <Landing />;
}
