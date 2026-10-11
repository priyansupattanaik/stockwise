# Stockan Platform

Institutional-grade stock market analysis platform featuring quantitative risk models, deterministic backtesting, and an AI analysis orchestrator with verifiable provenance.

## Key Features

- **8 Dedicated Interfaces**:
  1. **Dashboard**: Indices, session leaders, top decliners, earnings calendar, and SEC disclosures.
  2. **Symbol Detail**: Interactive SVG candlestick chart, volume histogram, moving average overlays, key financial stats & ratios, multi-period financial statements, and SEC Edgar filings.
  3. **Equity Screener**: Multi-metric quantitative filter builder with presets ("Large Cap Tech Leaders", "Value & Dividends", "High ROE"), sortable TanStack Table, and CSV export.
  4. **Watchlists**: Multi-list organization, symbol addition/removal, and hydrated live quotations.
  5. **Portfolio & Risk Analytics**: Position tracking with code-computed risk metrics (Beta vs SPY, Sharpe Ratio, Max Drawdown, Historical VaR 95%), sector exposures, stress test scenarios, and 252-day Monte Carlo simulations.
  6. **Alerts**: Price trigger rules, volume spikes, and indicator thresholds with notification event log.
  7. **AI Analysis Workspace**: 6 tool-orchestrated analytical features (Thesis Builder, NL Screener AST Compiler, Filing Diff, Portfolio Risk Explainer, Anomaly Explainer, and Backtest Assistant).
  8. **Design System & Settings**: Restrained Zinc neutral tokens, hairline borders, tabular figures, colorblind-safe gain/loss indicators, and session token metering.

- **Strict AI Non-Hallucination Guarantees**:
  - All numbers originate strictly from verified tool registry calls or analytical code execution.
  - Every thesis claim and filing diff includes an exact `SourceCitation` specifying origin, value, and timestamp.
  - Zero buy/sell directives; plain informational notices on all outputs.

---

## Architecture & Monorepo Structure

```
/apps
  /web                  # Next.js 15 App Router frontend
    /app                # Routes & layouts
    /components         # Base UI, charts, and layout primitives
    /content            # Centralized UI copy strings & banned phrases test
    /lib                # Formatters, typed API client, utilities
    /stores             # Scoped Zustand stores
  /api                  # Fastify REST API with OpenAPI documentation
    /src/modules        # Market, Screener, Watchlist, Portfolio, Alert, AI
    /src/core           # Config, typed errors, structured logger, middleware
    /src/providers      # Pluggable IMarketDataProvider (Mock, Stooq, etc.)
/packages
  /shared               # Zod schemas, types, and API contracts
  /analytics            # Pure TS: Technical indicators, risk metrics, deterministic backtest engine
  /config               # Base tsconfig, Tailwind preset
/docs
  architecture.md       # Architecture specification and data flow
  ai.md                 # AI Tool Registry, Prompt versions, and Token metering
```

---

## Quick Start

### Prerequisites
- Node.js >= 20
- pnpm >= 10

### 1. Installation
```bash
pnpm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

### 3. Running Development Servers
Start both the Fastify API (port 4000) and the Next.js Frontend (port 3000):
```bash
pnpm dev
```
Or start individually:
```bash
pnpm dev:api   # Starts Fastify API on http://localhost:4000
pnpm dev:web   # Starts Next.js Web on http://localhost:3000
```

- API Interactive Swagger Docs: `http://localhost:4000/docs`
- Web Platform: `http://localhost:3000`
- Design Tokens Showcase: `http://localhost:3000/design-system`

---

## Testing & Quality Assurance

Run all test suites across the monorepo:
```bash
pnpm --recursive run test
```
*Current test suite: 42 unit, contract, integration, and copy-lint tests passing.*

Run strict typecheck across all workspaces:
```bash
pnpm --recursive run typecheck
```

Build production packages and static bundles:
```bash
pnpm run build
```
