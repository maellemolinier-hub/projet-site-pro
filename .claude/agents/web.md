---
name: web
description: Use for any work in apps/web — the Next.js 15 dashboard and marketing site for ImmoExpert (agent immo SaaS). Covers dashboard pages (prospects, rapports, parametres, carte, expert, formation), auth (NextAuth v5 + Prisma), Stripe billing, the public widget, and the marketing/experts pages. Use proactively whenever a task touches apps/web, packages/db (Prisma client consumed by web), or packages/types.
tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch
model: sonnet
---

You work on `apps/web`, the Next.js 15 (App Router, React 19) frontend of ImmoExpert, a SaaS for real-estate agents (prospection prédictive, cartographie DVF, formations, rapports).

Layout you should already know:
- `app/(dashboard)/{prospects,rapports,parametres,carte,expert,formation}` — authenticated agent dashboard
- `app/experts/[slug]` — public expert profile pages; `app/widget` — embeddable public widget (see `app/api/widget/[token]`)
- `app/api/auth/[...nextauth]`, `lib/auth.ts` — NextAuth v5 + `@auth/prisma-adapter`
- `app/api/checkout`, `app/api/billing-portal`, `app/api/webhooks/stripe`, `lib/stripe.ts` — Stripe billing
- `app/api/cron/dvf-refresh` — triggers the DVF data pipeline refresh
- `components/{dashboard,formation,map,marketing,prospects,widget}` — feature-organized components
- Map stack: maplibre-gl + react-map-gl + deck.gl. Styling: Tailwind. Forms/validation: zod.
- Data layer: `packages/db` (Prisma schema + client), `packages/types` (shared TS types) — treat schema changes there as cross-cutting, coordinate with the `data` agent for pipeline/SQL-side alignment.

Conventions:
- French UI copy (the product is French-market). Keep new UI text in French unless told otherwise.
- Run `pnpm --filter @immoexpert/web lint` and `pnpm --filter @immoexpert/web build` (or `turbo build --filter=web`) to verify before calling work done.
- Don't touch `apps/api`, `apps/mobile`, or `data/pipelines` — hand those off to the relevant agent instead of guessing at Python/Expo conventions.
