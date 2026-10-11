# Stockwise Architecture

## 1. System Overview

Stockwise is an institutional-grade stock market analysis platform built with a TypeScript monorepo using pnpm workspaces. The architecture decouples analytical computations and data contracts from UI rendering and external vendor integrations.

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js Web App                        │
│          App Router, TanStack Query, Zustand, CSS Tokens    │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / SSE (/v1)
┌──────────────────────────────▼──────────────────────────────┐
│                       Fastify API                           │
│     Modules, Core Middleware, Ingestion, OpenAPI Docs       │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
┌──────────────▼──────────────┐┌──────────────▼───────────────┐
│     IMarketDataProvider     ││        AIToolRegistry        │
│ (Mock, Stooq, Vendor APIs)  ││ (Quote, Filings, Risk, Sim)  │
└──────────────┬──────────────┘└──────────────┬───────────────┘
               │                              │
               └──────────────┬───────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                   Packages / Dependencies                   │
│                                                             │
│  @stockwise/shared      Zod schemas, typed API envelopes      │
│  @stockwise/analytics   Pure TS: Indicators, Risk, Backtest   │
│  @stockwise/config      Base TSConfig, Tailwind tokens        │
└─────────────────────────────────────────────────────────────┘
```

## 2. Directory & Package Responsibilities

### `packages/shared`
- Canonical Zod schemas and TypeScript types.
- Zero business logic, zero vendor dependencies.
- Single source of truth for:
  - Market data schemas (`Quote`, `OHLCV`, `Fundamentals`, `Filing`, `EarningsItem`)
  - Screener schemas (`ScreenerQuery`, `ScreenerResult`, `ScreenerCriterion`)
  - Portfolio & Risk schemas (`Position`, `PortfolioRiskMetrics`, `DrawdownScenario`)
  - AI contracts (`ThesisReport`, `NLScreenerOutput`, `FilingDiffReport`, `BacktestAssistantResponse`)
  - Consistent API Envelopes (`ApiSuccessEnvelope`, `ApiErrorEnvelope`)

### `packages/analytics`
- Pure, deterministic quantitative library in TypeScript.
- Zero UI dependencies.
- Modules:
  - `indicators`: SMA, EMA, RSI (Wilder's smoothed), MACD, Bollinger Bands, ATR.
  - `risk`: Daily & log returns, annualized volatility, Sharpe ratio, Sortino ratio, max drawdown, historical & parametric Value at Risk (VaR 95%), Expected Shortfall (CVaR 95%), Beta vs benchmark (SPY), correlation matrix, sector exposures, deterministic drawdown scenarios, and Monte Carlo simulation.
  - `backtest`: Deterministic strategy execution engine evaluating entry/exit rule predicates bar-by-bar with slippage models, position tracking, trade records, and equity curve computation.

### `apps/api`
- High-throughput Fastify REST API server.
- Structured modules under `src/modules`:
  - `market`: Quote, history, fundamentals, earnings calendar, news, SEC filings.
  - `screener`: Multi-metric screening execution and preset queries.
  - `watchlist`: CRUD and live quotation hydration.
  - `portfolio`: Holdings tracking and full portfolio risk computation.
  - `alert`: Price trigger rules and notification logging.
  - `ai`: Typed tool registry orchestrator and analytical synthesis.
- Middleware:
  - Request ID tracing (`x-request-id`)
  - Idempotency key replay for write operations (`x-idempotency-key`)
  - Typed error envelope mapper (Validation, NotFound, Provider, RateLimit, Auth, InsufficientData)

### `apps/web`
- Next.js 15 App Router frontend.
- Strict token-driven design system with Zinc neutral base, hairline borders, tabular figures, and colorblind-safe gain/loss badges paired with signs/icons.
- Zero purple, zero gradients, zero glow effects, zero glassmorphism, zero emoji.
- All UI strings centralized in `apps/web/content/strings.ts` with automated test enforcement against marketing filler words.
- Skeletons for loading states; Error boundaries around each widget.

## 3. Data Integrity & AI Non-Hallucination Guarantees

1. **Tool-Registry Execution**: The AI layer cannot output ticker data from memory. All data passes through the typed `AIToolRegistry`.
2. **Traceable Citations**: Every bull and bear thesis claim and filing diff is paired with a `SourceCitation` object specifying source type, symbol, data field, value, filing form/date, and timestamp.
3. **Deterministic Backtesting**: Backtests describe strategies into structured JSON strategy ASTs and run directly through the pure math engine in `packages/analytics`.
4. **Informational Disclaimer**: All AI endpoints return mandatory regulatory non-advice disclosures.
