export * from './thesis.prompt';
export * from './nl-screener.prompt';
export * from './filing-diff.prompt';
export * from './portfolio-risk.prompt';
export * from './anomaly.prompt';
export * from './backtest.prompt';

export const PROMPT_REGISTRY = {
  thesis: {
    version: 'v1.4.0',
    description: 'Generates bull/bear cases from real financial data with verifiable citations',
  },
  nlScreener: {
    version: 'v1.2.0',
    description: 'Compiles natural language filtering intent into structured screener AST',
  },
  filingDiff: {
    version: 'v1.3.0',
    description: 'Calculates sequential filing variance and highlights material differences',
  },
  portfolioRisk: {
    version: 'v1.1.0',
    description: 'Synthesizes code-computed quantitative risk metrics and stress tests',
  },
  anomalyExplainer: {
    version: 'v1.2.0',
    description: 'Correlates statistical volume and price outliers with SEC filings and news',
  },
  backtestAssistant: {
    version: 'v1.5.0',
    description: 'Translates described rules into structured strategy specifications for deterministic backtesting',
  },
} as const;
