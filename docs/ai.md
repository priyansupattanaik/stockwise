# Stockwise AI Reasoning Layer Specification

## Overview

The Stockwise AI layer is implemented as a tool-orchestrated reasoning engine. It performs quantitative analysis and provenance-backed synthesis rather than summarization or generative speculation.

### Core Constraints
1. **Zero Hallucinated Numbers**: Every single number returned in reports must originate from a tool invocation or pure mathematical code execution.
2. **Explicit Provenance**: Every claim includes a `SourceCitation` detailing the originating quote, financial statement line, SEC filing accession number, or indicator output.
3. **Deterministic Execution**: The AI never generates raw ticker lists or performs portfolio math in its head; it compiles structured queries or specifications that are executed by local engines.
4. **Informational Non-Advice**: No buy or sell recommendations. Every response contains an informational notice.
5. **Insufficient Data Fallback**: When inputs lack adequate historical depth or disclosures, the model returns a typed `insufficient_data` status with an explicit explanation.

---

## Tool Registry

| Tool Name | Input Schema | Output Description |
|:---|:---|:---|
| `get_quote` | `{ symbol: string }` | Latest price, delayed quote status, session open/high/low/close, volume |
| `get_fundamentals` | `{ symbol: string }` | Profile, key financial ratios (P/E, ROE, margins, beta), quarterly financial statements |
| `get_filings` | `{ symbol: string }` | SEC Edgar 10-K, 10-Q disclosures with key disclosed metric extractions |
| `execute_screener` | `ScreenerQuery` (Zod AST) | Deterministic screener matching rows across the universe |
| `calculate_risk_metrics` | `{ positions, returns }` | Beta, Sharpe, Sortino, VaR 95%, CVaR 95%, max drawdown, scenarios, Monte Carlo paths |
| `run_backtest` | `StrategySpec` (Zod spec) | Deterministic trade simulation, win rate, equity curve, drawdown |

---

## The Six Analytical Features

### 1. Thesis Builder
- **Prompt Version**: `v1.4.0`
- **Output Schema**: `ThesisReportSchema`
- **Behavior**: Retrieves real-time delayed quote, multi-period financial statements, and SEC filings. Produces structured Bull and Bear cases where each point is directly backed by an immutable `SourceCitation`.

### 2. Natural-Language Screener
- **Prompt Version**: `v1.2.0`
- **Output Schema**: `NLScreenerOutputSchema`
- **Behavior**: Parses user natural language request into a validated `ScreenerQuery` AST. The query is then executed by the local database/screener engine.

### 3. Filing & Earnings Diff
- **Prompt Version**: `v1.3.0`
- **Output Schema**: `FilingDiffReportSchema`
- **Behavior**: Compares sequential periodic filings (e.g. 10-Q Q3 vs Q2) to flag material revenue and net income percentage variations, highlighting significant shifts with citations.

### 4. Portfolio Risk Explainer
- **Prompt Version**: `v1.1.0`
- **Output Schema**: `PortfolioRiskExplanationSchema`
- **Behavior**: Evaluates code-computed risk metrics (Beta, Sharpe, VaR 95%, sector allocations, and macroeconomic shock drawdown scenarios) and synthesizes an objective risk review without buy/sell advice.

### 5. Anomaly Explainer
- **Prompt Version**: `v1.2.0`
- **Output Schema**: `AnomalyExplanationReportSchema`
- **Behavior**: Detects trading deviations above statistical baseline (e.g. >2.5σ volume spikes or price movements) and correlates them to news and recent SEC disclosures.

### 6. Backtest Assistant
- **Prompt Version**: `v1.5.0`
- **Output Schema**: `BacktestAssistantResponseSchema`
- **Behavior**: Converts described rule logic into a formal `StrategySpec` and executes it through the deterministic simulation engine over 252 bars with a 5 basis point slippage model.

---

## Token Metering & Cost Accounting

Each inference request meters:
- Prompt Tokens
- Completion Tokens
- Estimated Cost in USD (formula: `(prompt * $2.50 + completion * $10.00) / 1,000,000`)
- Cache Hit Status (60-second TTL in-memory cache)

---

## Evaluation Suite & Regression Tests

The AI layer is validated against fixed golden fixtures located in `apps/api/src/modules/ai/evals/eval-fixtures.ts` through the automated regression suite in `apps/api/src/modules/ai/evals/ai-eval.test.ts`.

Evaluation invariants:
1. **Schema Validity**: All AI feature outputs validate against shared Zod schemas (`packages/shared/src/ai.schema.ts`).
2. **Numeric Fidelity & Provenance**: Claims must link to verified citations; numbers must strictly match tool records without hallucination.
3. **AST Correctness**: Plain queries compile into valid ScreenerQuery AST criteria executed by the deterministic screener engine.
4. **Deterministic Math**: Filing variances and portfolio risk metrics match exact mathematical calculations.
5. **Data Sufficiency Handling**: Missing disclosures trigger an explicit `insufficient_data` status with a descriptive reason.
