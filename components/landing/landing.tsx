'use client';

import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  ScanText,
  ArrowRightLeft,
  Users,
  ClipboardCheck,
  Check,
  TrendingUp,
  AlertTriangle,
  Brain,
  PackageX,
  Receipt,
  ShieldX,
  LineChart,
  Database,
  Plug,
  Workflow,
  Lock,
  Eye,
  Truck,
  Pill,
  Briefcase,
  Quote,
  HelpCircle,
} from 'lucide-react';

export function Landing() {
  return (
    <div className="min-h-screen bg-surface-0 text-text-primary">
      {/* Skip to content for keyboard users */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent-primary focus:text-text-inverse focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Top nav */}
      <Nav />

      <main id="main">
        <Hero />
        <Marquee />
        <Problem />
        <WhatIs />
        <UseCases />
        <Comparison />
        <HowItWorks />
        <Trust />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}

// ============================================================
// Nav
// ============================================================
function Nav() {
  return (
    <nav className="border-b border-border-subtle bg-surface-0/85 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="Wotmind home">
          <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center shadow-lg shadow-accent-primary/30 group-hover:shadow-accent-primary/50 transition-shadow">
            <Sparkles className="w-4 h-4 text-text-inverse" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight">Wotmind</span>
          <span className="hidden sm:inline text-[9px] font-semibold text-text-tertiary uppercase tracking-widest bg-surface-3 px-1.5 py-0.5 rounded">
            Beta
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {[
            { label: 'Product', href: '#what-is' },
            { label: 'Use cases', href: '#use-cases' },
            { label: 'How it works', href: '#how-it-works' },
            { label: 'Security', href: '#trust' },
            { label: 'FAQ', href: '#faq' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="px-3 py-2 text-[13px] text-text-secondary hover:text-text-primary transition-colors rounded-md"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden sm:inline-flex text-[13px] text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-md transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 h-8 sm:h-9 rounded-lg bg-accent-primary text-text-inverse text-[12px] sm:text-[13px] font-semibold hover:bg-accent-primary-hover transition-colors shadow-md shadow-accent-primary/30"
          >
            Get started
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ============================================================
// Hero
// ============================================================
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[900px] h-[600px] max-w-full rounded-full bg-accent-primary/10 blur-3xl" />
        <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-accent-purple/5 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 text-center animate-fade-in">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-[11px] font-semibold mb-6">
          <Sparkles className="w-3 h-3" aria-hidden="true" />
          AI-first business orchestration
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-5 leading-[1.05]">
          Your business shouldn&apos;t fail
          <br />
          <span className="text-gradient">because operations are broken.</span>
        </h1>

        <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed px-2">
          Nigerian businesses are losing money through stockouts, fake reimbursements,
          payroll errors, and disconnected systems.{' '}
          <span className="text-text-primary font-medium">
            Wotmind is an AI business brain
          </span>{' '}
          that thinks, verifies, and executes — powered by Squad.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mb-10">
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 h-11 rounded-lg bg-accent-primary text-text-inverse text-sm font-semibold hover:bg-accent-primary-hover transition-all shadow-lg shadow-accent-primary/30 hover:shadow-xl hover:shadow-accent-primary/40 hover:-translate-y-0.5"
          >
            Get early access
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <a
            href="#demo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 h-11 rounded-lg bg-surface-1 border border-border text-sm font-semibold hover:border-text-tertiary transition-colors"
          >
            Book a demo
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] sm:text-[12px] text-text-tertiary">
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-accent-green" aria-hidden="true" />
            No credit card
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-accent-green" aria-hidden="true" />
            100 free runs
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-accent-green" aria-hidden="true" />
            Built for Nigerian MSMEs
          </span>
        </div>
      </div>

      {/* Animated workflow preview */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div
          className="bg-surface-1 border border-border rounded-2xl overflow-hidden shadow-2xl shadow-black/40 animate-fade-in-up"
          style={{ animationDelay: '0.15s' }}
        >
          <div className="border-b border-border bg-surface-1/80 px-4 py-2.5 flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-accent-red/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-accent-amber/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-accent-green/60" />
            </div>
            <span className="ml-3 text-[11px] text-text-tertiary font-mono hidden sm:inline">
              wotmind.app/workflows
            </span>
          </div>

          <div className="bg-canvas-bg p-6 sm:p-10 relative h-[200px] sm:h-[280px] overflow-hidden">
            <div
              className="absolute inset-0 opacity-50"
              style={{
                backgroundImage:
                  'radial-gradient(circle, var(--canvas-dot) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
              aria-hidden="true"
            />
            <div className="relative flex items-center justify-center gap-3 sm:gap-6 lg:gap-8 h-full overflow-x-auto">
              {[
                { icon: Sparkles, color: 'text-node-trigger', bg: 'bg-node-trigger/10', border: 'border-node-trigger/30', label: 'Trigger', sub: 'Event detected' },
                { icon: ScanText, color: 'text-node-ocr', bg: 'bg-node-ocr/10', border: 'border-node-ocr/30', label: 'OCR', sub: 'Extract data' },
                { icon: Shield, color: 'text-node-trust', bg: 'bg-node-trust/10', border: 'border-node-trust/30', label: 'Verify', sub: 'AI risk score' },
                { icon: ArrowRightLeft, color: 'text-node-transfer', bg: 'bg-node-transfer/10', border: 'border-node-transfer/30', label: 'Pay', sub: 'Via Squad' },
                { icon: ClipboardCheck, color: 'text-node-audit', bg: 'bg-node-audit/10', border: 'border-node-audit/30', label: 'Audit', sub: 'Immutable log' },
              ].map((step, idx, arr) => {
                const Icon = step.icon;
                return (
                  <div key={step.label} className="flex items-center gap-2 sm:gap-4 lg:gap-8 shrink-0">
                    <div
                      className={`bg-surface-1 border ${step.border} rounded-xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 shadow-lg flex flex-col items-start gap-1`}
                      style={{ animation: `fade-in-up 0.5s ease ${0.4 + idx * 0.12}s both` }}
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center ${step.bg}`}>
                          <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${step.color}`} aria-hidden="true" />
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-semibold">{step.label}</span>
                      </div>
                      <span className="text-[9px] sm:text-[10px] text-text-tertiary">{step.sub}</span>
                    </div>
                    {idx < arr.length - 1 && (
                      <div
                        className="h-px w-3 sm:w-6 bg-accent-primary/60"
                        style={{ animation: `fade-in 0.4s ease ${0.45 + idx * 0.12}s both` }}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Marquee
// ============================================================
function Marquee() {
  return (
    <section className="border-y border-border-subtle bg-surface-1/30 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className="text-center text-[11px] uppercase tracking-widest text-text-tertiary font-semibold mb-4">
          Powering the next generation of Nigerian businesses
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 opacity-70">
          {['Squad', 'Gemini', 'Twilio', 'Supabase', 'WhatsApp', 'PostgreSQL'].map((name) => (
            <span key={name} className="text-sm font-semibold text-text-tertiary tracking-tight">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Problem
// ============================================================
function Problem() {
  const problems = [
    { icon: TrendingUp, title: 'Inflation pressure', description: 'Naira devaluation and rising costs are squeezing margins. Every leak compounds.', color: 'text-accent-red', bg: 'bg-accent-red/10' },
    { icon: PackageX, title: 'Inventory losses', description: 'Stockouts cost sales; overstock ties up capital and expires on the shelf.', color: 'text-accent-amber', bg: 'bg-accent-amber/10' },
    { icon: Receipt, title: 'Fake reimbursements', description: 'Doctored receipts and duplicate claims drain ₦millions every year, undetected.', color: 'text-accent-purple', bg: 'bg-accent-purple/10' },
    { icon: ShieldX, title: 'Compliance penalties', description: 'Manual payroll, VAT, PAYE — one mistake costs more than a year of automation.', color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
    { icon: AlertTriangle, title: 'Operational leakages', description: 'Slow approvals, duplicate payments, missed renewals — death by a thousand cuts.', color: 'text-accent-amber', bg: 'bg-accent-amber/10' },
    { icon: LineChart, title: 'Passive fintech', description: 'Dashboards report problems. They don\'t solve them. Your tools are watching, not acting.', color: 'text-accent-green', bg: 'bg-accent-green/10' },
  ];

  return (
    <section id="problem" className="py-16 sm:py-24 border-b border-border-subtle">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-accent-primary mb-3">The problem</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Nigerian businesses are bleeding money</h2>
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
            Most failures aren&apos;t product failures. They&apos;re operational failures — quiet, daily, compounding.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {problems.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="bg-surface-1 border border-border rounded-xl p-5 hover:border-border/80 hover:bg-surface-1/80 transition-all"
                style={{ animation: `fade-in-up 0.4s ease ${idx * 0.05}s both` }}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${p.bg}`}>
                  <Icon className={`w-5 h-5 ${p.color}`} aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold mb-1.5">{p.title}</h3>
                <p className="text-[13px] text-text-secondary leading-relaxed">{p.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-14 sm:mt-16 max-w-3xl mx-auto text-center">
          <Quote className="w-10 h-10 text-accent-primary/40 mx-auto mb-4" aria-hidden="true" />
          <p className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
            Businesses don&apos;t need more dashboards.
            <br />
            <span className="text-gradient">They need systems that think and act.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// What Is Wotmind
// ============================================================
function WhatIs() {
  const steps = [
    { label: 'Trigger', icon: Zap, color: 'text-node-trigger', bg: 'bg-node-trigger/10', border: 'border-node-trigger/30', title: 'Detect business events', description: 'Stock running low, receipt uploaded, payroll due, expense submitted — anything you can describe.' },
    { label: 'AI Logic', icon: Brain, color: 'text-accent-purple', bg: 'bg-accent-purple/10', border: 'border-accent-purple/30', title: 'Reason and verify', description: 'AI checks legitimacy, predicts risk, learns your patterns, and decides the right action.' },
    { label: 'Financial Action', icon: ArrowRightLeft, color: 'text-node-transfer', bg: 'bg-node-transfer/10', border: 'border-node-transfer/30', title: 'Execute autonomously', description: 'Transfer funds, send SMS approvals, log audits — all through Squad. No human in the loop unless needed.' },
  ];

  return (
    <section id="what-is" className="py-16 sm:py-24 border-b border-border-subtle">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-accent-primary mb-3">What is Wotmind</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Payment rails, reimagined as an AI operating system</h2>
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
            Squad gives you the rails. Wotmind gives them a brain. Every event, every decision, every payout — orchestrated by AI you can trust.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-12">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className={`relative bg-surface-1 border ${s.border} rounded-2xl p-5 sm:p-6`}
                style={{ animation: `fade-in-up 0.4s ease ${idx * 0.08}s both` }}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${s.bg}`}>
                  <Icon className={`w-5 h-5 ${s.color}`} aria-hidden="true" />
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-widest ${s.color} mb-2 block`}>
                  Step {idx + 1} · {s.label}
                </span>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-[13px] text-text-secondary leading-relaxed">{s.description}</p>
                {idx < 2 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-surface-2 border border-border items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-text-secondary" aria-hidden="true" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { value: '5×', label: 'Faster approvals' },
            { value: '90%', label: 'Less manual work' },
            { value: '24/7', label: 'Always-on execution' },
            { value: '₦0', label: 'Setup cost' },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface-1 border border-border rounded-xl p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-gradient tracking-tight">{stat.value}</p>
              <p className="text-[11px] sm:text-[12px] text-text-tertiary mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Use Cases
// ============================================================
function UseCases() {
  const cases = [
    { icon: Pill, color: 'text-accent-blue', bg: 'bg-accent-blue/10', border: 'border-accent-blue/30', industry: 'Pharmacies & Retail', problem: 'Stockouts cost sales. Expired stock costs cash.', solution: 'Wotmind predicts depletion from sales velocity, drafts the purchase order, and pays the supplier automatically before the shelf goes empty.', outcomes: ['↓ 60% stockouts', '↓ 35% expired stock', '↑ 18% margin'] },
    { icon: Truck, color: 'text-accent-amber', bg: 'bg-accent-amber/10', border: 'border-accent-amber/30', industry: 'Logistics & Field Ops', problem: 'Fake fuel receipts. Slow reimbursements. No paper trail.', solution: 'Driver snaps a receipt. AI verifies it against vendor history and trip data. If clean, Squad transfers reimbursement in minutes. If suspicious, manager gets SMS for approval.', outcomes: ['↓ 80% fraud', '↓ 24h → 5min', 'Full audit trail'] },
    { icon: Briefcase, color: 'text-accent-green', bg: 'bg-accent-green/10', border: 'border-accent-green/30', industry: 'Startups & SMEs', problem: 'Manual payroll. Tax mistakes. Compliance penalties.', solution: 'On payday, Wotmind calculates PAYE/pension/NHF, runs AI risk on each transfer, sends each staffer their net via Squad, and files the audit report.', outcomes: ['100% on-time payroll', 'PAYE auto-calculated', 'Zero compliance gaps'] },
  ];

  return (
    <section id="use-cases" className="py-16 sm:py-24 border-b border-border-subtle bg-surface-1/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-accent-primary mb-3">Use cases</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Built for the businesses that keep Nigeria running</h2>
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
            From neighborhood pharmacies to fast-growing startups — same brain, different jobs.
          </p>
        </div>

        <div className="space-y-4">
          {cases.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={c.industry}
                className={`bg-surface-1 border ${c.border} rounded-2xl p-5 sm:p-6 lg:p-8`}
                style={{ animation: `fade-in-up 0.4s ease ${idx * 0.08}s both` }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_auto] gap-5 lg:gap-8 items-start">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${c.bg}`}>
                      <Icon className={`w-6 h-6 ${c.color}`} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold mb-1">{c.industry}</h3>
                      <p className="text-[13px] text-text-tertiary">{c.problem}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary mb-2">How Wotmind solves it</p>
                    <p className="text-[14px] text-text-secondary leading-relaxed">{c.solution}</p>
                  </div>

                  <div className="flex flex-wrap lg:flex-col gap-1.5 lg:gap-2">
                    {c.outcomes.map((o) => (
                      <span key={o} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${c.border} ${c.bg} ${c.color} whitespace-nowrap`}>
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Comparison
// ============================================================
function Comparison() {
  return (
    <section className="py-16 sm:py-24 border-b border-border-subtle">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-accent-primary mb-3">Why it&apos;s different</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">The shift: from passive to autonomous</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-1 border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <LineChart className="w-5 h-5 text-text-tertiary" aria-hidden="true" />
              <h3 className="text-base font-bold text-text-tertiary">Traditional software</h3>
            </div>
            <ul className="space-y-3 text-[13px] text-text-secondary">
              {[
                'Passive — shows you what already happened',
                'Analytics-only — dashboards and reports',
                'Manual — humans approve every payment',
                'Reactive — you discover issues after the loss',
                'Disconnected — every tool is its own island',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-text-tertiary mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-accent-primary/15 via-surface-1 to-surface-1 border border-accent-primary/40 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-accent-primary/10 blur-2xl" aria-hidden="true" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles className="w-5 h-5 text-accent-primary" aria-hidden="true" />
                <h3 className="text-base font-bold text-accent-primary">Wotmind</h3>
              </div>
              <ul className="space-y-3 text-[13px] text-text-primary">
                {[
                  'Intelligent — reasons through operational problems',
                  'Autonomous — executes actions, not just reports',
                  'Predictive — flags risks before they cost you',
                  'Proactive — runs 24/7, alerts you only when needed',
                  'Connected — one brain orchestrates every system',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-accent-primary mt-1 shrink-0" aria-hidden="true" strokeWidth={3} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// How It Works
// ============================================================
function HowItWorks() {
  const steps = [
    { number: '01', icon: Plug, title: 'Connect your systems', description: 'Squad for payments. Twilio for SMS. Your inventory or POS data. Wotmind plugs in without ripping anything out.' },
    { number: '02', icon: Workflow, title: 'Describe a workflow', description: 'Type what you want in plain English. Our AI assembles the nodes — triggers, checks, payouts — on a visual canvas.' },
    { number: '03', icon: Brain, title: 'AI reasons through each event', description: 'Pattern learning, anomaly detection, velocity checks, custom rules — every transaction gets a risk score.' },
    { number: '04', icon: ArrowRightLeft, title: 'Execute or escalate', description: 'Low-risk: Squad pays instantly. Medium: SMS approval. High: full review. You set the thresholds, Wotmind enforces them.' },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 border-b border-border-subtle bg-surface-1/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-accent-primary mb-3">How it works</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">From signup to first autonomous payment in minutes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative bg-surface-1 border border-border rounded-xl p-5 hover:border-accent-primary/30 transition-colors"
                style={{ animation: `fade-in-up 0.4s ease ${idx * 0.06}s both` }}
              >
                <span className="text-[10px] font-mono font-semibold text-accent-primary/70 mb-3 block">{step.number}</span>
                <div className="w-10 h-10 rounded-lg bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-accent-primary" aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold mb-1.5">{step.title}</h3>
                <p className="text-[12.5px] text-text-secondary leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Trust & Security
// ============================================================
function Trust() {
  const items = [
    { icon: Brain, title: 'AI verification', description: 'Every transaction gets scored against learned baselines, velocity limits, and your custom rules.' },
    { icon: ShieldX, title: 'Fraud detection', description: 'Duplicate receipts, anomalous amounts, new beneficiaries — caught before money leaves your account.' },
    { icon: Database, title: 'Immutable audit logs', description: 'Every event, every decision, every approval — recorded permanently. Export anytime for compliance.' },
    { icon: Users, title: 'Human approvals', description: 'You set thresholds. Wotmind respects them. SMS approval works on any phone, anywhere.' },
    { icon: Lock, title: 'Squad-powered rails', description: 'Bank-grade payment infrastructure. We never hold your funds — Squad does, with full regulatory backing.' },
    { icon: Eye, title: 'Row-level security', description: 'Multi-tenant isolation enforced at the database level. Your data is yours alone.' },
  ];

  return (
    <section id="trust" className="py-16 sm:py-24 border-b border-border-subtle">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-accent-green mb-3">Trust &amp; security</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Autonomous, but never out of your control</h2>
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
            Speed without control is just risk. Wotmind ships with security primitives baked in.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-surface-1 border border-border rounded-xl p-5 hover:border-accent-green/30 transition-colors"
                style={{ animation: `fade-in-up 0.4s ease ${idx * 0.05}s both` }}
              >
                <div className="w-10 h-10 rounded-lg bg-accent-green/10 border border-accent-green/30 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-accent-green" aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold mb-1.5">{item.title}</h3>
                <p className="text-[13px] text-text-secondary leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FAQ
// ============================================================
function FAQ() {
  const faqs = [
    { q: 'Is my money safe? Who holds the funds?', a: 'Wotmind never holds your funds. All money movement happens through Squad — a regulated, licensed payments provider. Wotmind is the brain; Squad is the bank rail.' },
    { q: 'Can the AI make a payment without my approval?', a: 'Only if you tell it to. You define thresholds (e.g. "auto-approve under ₦10k, require SMS for ₦10k–₦100k, block above ₦500k"). Wotmind enforces them.' },
    { q: 'What happens if the AI gets it wrong?', a: 'Every decision is logged with the full reasoning chain. You can review, dispute, and adjust the rules. The system learns from corrections.' },
    { q: 'Do I need to write code?', a: 'No. Describe the workflow in plain English. Wotmind builds it on a visual canvas. Click "Run" to test, click "Activate" to go live.' },
    { q: 'How does pricing work?', a: 'Free for your first 100 automation runs. Then ₦200 per run on the Starter plan, or fixed monthly on Pro. No setup fees, no contracts.' },
    { q: 'What about my data and compliance?', a: 'Data is stored in Supabase with row-level security. You can export and delete at any time. We comply with NDPR and GDPR principles.' },
  ];

  return (
    <section id="faq" className="py-16 sm:py-24 border-b border-border-subtle bg-surface-1/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-accent-primary mb-3">FAQ</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Questions, answered</h2>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => (
            <details
              key={faq.q}
              className="group bg-surface-1 border border-border rounded-xl overflow-hidden"
              style={{ animation: `fade-in 0.4s ease ${idx * 0.04}s both` }}
            >
              <summary className="cursor-pointer flex items-center justify-between gap-3 px-4 sm:px-5 py-4 hover:bg-surface-2/40 transition-colors list-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-3 text-[14px] sm:text-[15px] font-semibold text-text-primary">
                  <HelpCircle className="w-4 h-4 text-accent-primary shrink-0" aria-hidden="true" />
                  {faq.q}
                </span>
                <span className="w-6 h-6 rounded-full bg-surface-2 border border-border flex items-center justify-center text-text-tertiary group-open:rotate-45 transition-transform shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <div className="px-4 sm:px-5 pb-4 pl-11 sm:pl-12 text-[13px] sm:text-[14px] text-text-secondary leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Final CTA
// ============================================================
function FinalCTA() {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-accent-primary/15 blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-primary/10 border border-accent-primary/30 mb-6">
          <Zap className="w-7 h-7 text-accent-primary" aria-hidden="true" />
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 leading-tight">
          Stop losing money to broken operations.
        </h2>
        <p className="text-text-secondary text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
          Your business doesn&apos;t need another dashboard. It needs an intelligent system that thinks, verifies, and acts.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-12 rounded-lg bg-accent-primary text-text-inverse text-base font-semibold hover:bg-accent-primary-hover transition-all shadow-xl shadow-accent-primary/30 hover:shadow-2xl hover:shadow-accent-primary/40 hover:-translate-y-0.5"
          >
            Start free
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-12 rounded-lg bg-surface-1 border border-border text-base font-semibold hover:border-text-tertiary transition-colors"
          >
            I have an account
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Footer
// ============================================================
function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-surface-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-md bg-accent-primary flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-text-inverse" strokeWidth={2.5} />
              </div>
              <span className="text-base font-bold tracking-tight">Wotmind</span>
            </Link>
            <p className="text-[12px] text-text-tertiary leading-relaxed max-w-xs">
              The AI business brain for Nigerian businesses. Built on Squad infrastructure.
            </p>
          </div>

          {[
            { title: 'Product', links: [
              { label: 'How it works', href: '#how-it-works' },
              { label: 'Use cases', href: '#use-cases' },
              { label: 'Security', href: '#trust' },
              { label: 'Pricing', href: '#' },
            ]},
            { title: 'Company', links: [
              { label: 'About', href: '#' },
              { label: 'Blog', href: '#' },
              { label: 'Careers', href: '#' },
              { label: 'Contact', href: '#' },
            ]},
            { title: 'Legal', links: [
              { label: 'Privacy', href: '#' },
              { label: 'Terms', href: '#' },
              { label: 'NDPR', href: '#' },
              { label: 'Status', href: '#' },
            ]},
          ].map((col) => (
            <div key={col.title}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary mb-3">
                {col.title}
              </p>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-[12px] text-text-secondary hover:text-text-primary transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-text-tertiary">
          <span>© 2026 Wotmind. Built for Nigerian businesses.</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-text-primary transition-colors">Twitter</a>
            <a href="#" className="hover:text-text-primary transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-text-primary transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
