# Wotmind

**AI business brain for modern African businesses.** Wotmind transforms Squad's payment infrastructure into intelligent operational execution — triggers fire, AI reasons, money moves, audits log.

> Trigger → AI Logic → Financial Action

---

## What it does

| Use case | Trigger | AI logic | Action |
|---|---|---|---|
| Receipt reimbursement | Receipt uploaded | OCR + trust scoring | Squad transfer + SMS receipt |
| Payroll | Pay date arrives | PAYE/anomaly checks | N parallel Squad transfers |
| Inventory restock | Stock < reorder point | Velocity prediction | Auto-PO + supplier payment |
| Expense approval | Staff submits | Risk + custom rules | Auto-approve · SMS approval · block |

Every step is auditable. Every payment is sandboxed by your thresholds. Every decision is logged immutably.

---

## Stack

- **Next.js 16** (App Router, Turbopack, React 19)
- **TypeScript** strict mode
- **Supabase** — Postgres, RLS, realtime, auth
- **Gemini 2.5 Flash** — OCR + workflow generation (streaming)
- **Squad API** — NGN bank transfers (sandbox + live)
- **Twilio + WhatsApp** — SMS approvals
- **React Flow** (@xyflow/react) — visual workflow editor
- **Tailwind v4** — styling
- **Zustand + TanStack Query** — state + server cache

---

## Quick start

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example .env.local
# Edit .env.local with your Supabase + Gemini + Squad keys

# 3. Run the SQL schema (one time)
# Open Supabase SQL Editor, paste supabase/schema.sql, click Run

# 4. Disable email confirmation in Supabase Auth → Email (optional but recommended for demos)

# 5. Dev
npm run dev
```

Then visit [http://localhost:3000](http://localhost:3000) → sign up → land on the dashboard.

---

## Project structure

```
app/
  (auth)/             # /login, /signup
  (app)/              # protected app (sidebar + topbar)
    dashboard/
    workflows/        # list + new + [id] editor
    automations/      # list + new (wizard) + [id]
    payroll/ expenses/ inventory/ audit/ demo/
  api/                # all server routes
    ai/generate-workflow/[stream]/   # SSE-streaming workflow generator
    automations/[id]/run             # AI engine + execution
    workflows/[id]/run               # workflow runner
    approvals/[token]                # SMS approval landing
    webhooks/twilio                  # inbound SMS replies
  layout.tsx          # root metadata, providers, fonts
  page.tsx            # landing page
  not-found.tsx error.tsx loading.tsx global-error.tsx
  robots.ts sitemap.ts manifest.ts

components/
  layout/             # Sidebar, Topbar, AuthProvider, SetupBanner
  workflow/           # Canvas nodes, plus-edge, picker, properties panel, AI bar
  automation/         # Step indicator, wizard pieces
  ui/                 # Button, Card, Badge, Input, Skeleton, EmptyState

lib/
  ai/                 # Engine, scorer, decision rules, 5 parallel checks
  api/                # Centralized fetch wrapper + error helpers
  notifications/      # SMS, WhatsApp, dispatcher
  squad/              # Squad API client
  supabase/           # Server + browser clients
  trust/              # Receipt-specific trust engine (legacy demo path)
  workflow/           # Node registry, runner, executor, step handlers

middleware.ts         # Auth-aware route protection + session refresh
supabase/schema.sql   # Full DDL + RLS + triggers (one-time setup)
```

---

## Deployment

### Vercel (recommended)

```bash
# 1. Push to GitHub
# 2. Import to Vercel, set the env vars from .env.example
# 3. Deploy
```

Notes:
- Set `NEXT_PUBLIC_APP_URL` to your production domain (e.g. `https://wotmind.app`).
- The Twilio webhook URL is `https://<your-domain>/api/webhooks/twilio` — configure it in your Twilio number settings.
- Supabase Auth → URL configuration: add your production domain to the allowed redirects.
- For email confirmation **off**, set Supabase Auth → Email → "Confirm email" to off.

### Self-hosted

```bash
npm run build
npm run start
```

Run behind a reverse proxy (Nginx, Caddy) with HTTPS. Use a process manager (PM2, systemd) to keep `npm run start` alive.

### Database

The schema lives in `supabase/schema.sql`. It is:
- **Safe to re-run** — uses `create table if not exists` and idempotent policy creation.
- **RLS-enforced** — every table has `auth.uid() = user_id` policies so users only see their own data.
- **Auto-profile** — a trigger creates a `profiles` row whenever an auth user is created.

---

## Production checklist

- [ ] `npm run build` succeeds with no TypeScript errors
- [ ] `supabase/schema.sql` has been run in your Supabase project
- [ ] `.env.local` (or host env) has all required variables
- [ ] Supabase Auth → Email → "Confirm email" toggled as you want
- [ ] Supabase Auth → URL configuration → Site URL + Redirect URLs match production
- [ ] Squad API: switch to live keys when ready (`SQUAD_SECRET_KEY=live_sk_...`)
- [ ] Twilio: verified phone number for sending, webhook URL configured
- [ ] `NEXT_PUBLIC_APP_URL` set to production URL (used in OG tags, sitemap, approval links)
- [ ] DNS pointed, HTTPS enabled
- [ ] Monitoring: add Sentry/LogRocket to `app/error.tsx` and `app/global-error.tsx`

---

## Architecture decisions

### Why streaming for AI workflow generation?
Gemini takes 3–8 seconds to fully generate a workflow JSON. Streaming nodes one-by-one (via SSE) lets the canvas animate as the AI thinks — perceived latency drops from "frozen" to "magical".

### Why RLS instead of app-level auth checks?
Defense in depth. Every API route also calls `getUser()`, but RLS guarantees that even if an authz check is missed, the database refuses to leak rows.

### Why Welford's algorithm for AI pattern learning?
Streaming mean/variance updates with no need to store historical samples. After ~5 runs per user × automation type, the AI knows what "normal" looks like and can flag anomalies.

### Why a visual workflow editor *and* a wizard for automations?
Two personas. **Workflows** = power users who want to compose any flow. **Automations** = MSME owners who pick a use-case (Payroll, Expenses) and configure thresholds. Same engine under the hood.

---

## Roadmap

- [ ] Real-time co-editing on the workflow canvas (Supabase Realtime)
- [ ] LangGraph-style multi-agent reasoning for complex workflows
- [ ] CSV bulk import for staff/inventory
- [ ] Mobile native app (React Native + same Supabase backend)
- [ ] Pricing + Stripe billing
- [ ] Sentry / OpenTelemetry traces
- [ ] Approval routing trees (manager → finance → CEO)

---

## License

MIT
