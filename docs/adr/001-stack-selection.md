# ADR 001: Monorepo Architecture & Technology Stack

## Status
Accepted

## Context
A professional stock market quantitative analysis and AI research application requires high throughput API endpoints, pure mathematical computation modules, strict schema guarantees, and an institutional user interface.

## Decision
1. **TypeScript Monorepo (pnpm workspaces)**: Separates concerns into pure computation (`@stockwise/analytics`), contract schemas (`@stockwise/shared`), backend services (`@stockwise/api`), and web interface (`@stockwise/web`).
2. **Fastify for API**: Delivers low latency, high throughput, and seamless OpenAPI generation with typed validation hooks.
3. **Next.js (App Router) for Web**: Provides modern React Server and Client component separation, zero unnecessary client-side JavaScript, and route-based code splitting.
4. **Zod for Canonical Schemas**: Enforces runtime validation across network boundaries, input requests, and AI tool outputs.
5. **Tailwind CSS + Zinc Neutral Tokens**: Eliminates decorative styling, enforcing hairline borders, tabular numerals, and colorblind-safe gain/loss indicators.
