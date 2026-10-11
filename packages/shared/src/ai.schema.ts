import { z } from 'zod';
import { ScreenerQuerySchema } from './screener.schema';

// Traceable data citation
export const SourceCitationSchema = z.object({
  sourceType: z.enum(['quote', 'financial_statement', 'sec_filing', 'news', 'calculated_metric']),
  symbol: z.string(),
  field: z.string(),
  value: z.union([z.number(), z.string()]),
  filingForm: z.string().optional(),
  filingDate: z.string().optional(),
  articleUrl: z.string().optional(),
  timestamp: z.string(),
});

export type SourceCitation = z.infer<typeof SourceCitationSchema>;

// Claim item with traceable source backing
export const CitedClaimSchema = z.object({
  claim: z.string(),
  evidence: z.string(),
  citation: SourceCitationSchema,
});

export type CitedClaim = z.infer<typeof CitedClaimSchema>;

// Tool execution log
export const ToolCallLogSchema = z.object({
  toolName: z.enum([
    'get_quote',
    'get_fundamentals',
    'get_filings',
    'execute_screener',
    'calculate_risk_metrics',
    'run_backtest',
  ]),
  input: z.record(z.string(), z.any()),
  outputSummary: z.string(),
  executionTimeMs: z.number(),
});

export type ToolCallLog = z.infer<typeof ToolCallLogSchema>;

// Usage and Cost metering
export const TokenUsageSchema = z.object({
  promptTokens: z.number(),
  completionTokens: z.number(),
  totalTokens: z.number(),
  estimatedCostUsd: z.number(),
  cacheHit: z.boolean().default(false),
});

export type TokenUsage = z.infer<typeof TokenUsageSchema>;

// 1. Thesis Builder Schema
export const ThesisReportSchema = z.object({
  symbol: z.string(),
  generatedAt: z.string(),
  promptVersion: z.string(),
  dataSufficiency: z.enum(['sufficient', 'insufficient_data', 'partial']),
  insufficientDataReason: z.string().optional(),
  bullCase: z.object({
    summary: z.string(),
    points: z.array(CitedClaimSchema),
  }),
  bearCase: z.object({
    summary: z.string(),
    points: z.array(CitedClaimSchema),
  }),
  keyMetricsTrace: z.array(SourceCitationSchema),
  regulatoryNotice: z.string().default('Informational analysis only. Not investment or financial advice.'),
  toolCalls: z.array(ToolCallLogSchema),
  usage: TokenUsageSchema,
});

export type ThesisReport = z.infer<typeof ThesisReportSchema>;

// 2. Natural-Language Screener Output Schema
export const NLScreenerOutputSchema = z.object({
  originalQuery: z.string(),
  structuredQuery: ScreenerQuerySchema,
  queryInterpretation: z.string(),
  promptVersion: z.string(),
  usage: TokenUsageSchema,
});

export type NLScreenerOutput = z.infer<typeof NLScreenerOutputSchema>;

// 3. Filing and Earnings Diff Schema
export const MaterialChangeSchema = z.object({
  metricOrSection: z.string(),
  priorPeriodValue: z.union([z.number(), z.string()]),
  currentPeriodValue: z.union([z.number(), z.string()]),
  percentChange: z.number().nullable().optional(),
  significance: z.enum(['high', 'medium', 'low']),
  explanation: z.string(),
  citation: SourceCitationSchema,
});

export type MaterialChange = z.infer<typeof MaterialChangeSchema>;

export const FilingDiffReportSchema = z.object({
  symbol: z.string(),
  priorFilingId: z.string(),
  priorPeriodDate: z.string(),
  currentFilingId: z.string(),
  currentPeriodDate: z.string(),
  generatedAt: z.string(),
  promptVersion: z.string(),
  dataSufficiency: z.enum(['sufficient', 'insufficient_data', 'partial']),
  changes: z.array(MaterialChangeSchema),
  riskFactorsSummary: z.string(),
  regulatoryNotice: z.string().default('Informational analysis only. Not investment or financial advice.'),
  toolCalls: z.array(ToolCallLogSchema),
  usage: TokenUsageSchema,
});

export type FilingDiffReport = z.infer<typeof FilingDiffReportSchema>;

// 4. Portfolio Risk Analysis Explanation Schema
export const PortfolioRiskExplanationSchema = z.object({
  portfolioId: z.string(),
  generatedAt: z.string(),
  promptVersion: z.string(),
  concentrationSummary: z.string(),
  sectorExposureSummary: z.string(),
  drawdownRiskAnalysis: z.string(),
  vulnerablePositions: z.array(z.string()),
  codeComputedMetricsSummary: z.object({
    beta: z.number(),
    annualizedVolatility: z.number(),
    maxDrawdown: z.number(),
    var95: z.number(),
  }),
  regulatoryNotice: z.string().default('Informational analysis only. Not investment or financial advice.'),
  toolCalls: z.array(ToolCallLogSchema),
  usage: TokenUsageSchema,
});

export type PortfolioRiskExplanation = z.infer<typeof PortfolioRiskExplanationSchema>;

// 5. Anomaly Explainer Schema
export const AnomalyExplanationReportSchema = z.object({
  symbol: z.string(),
  detectedAt: z.string(),
  promptVersion: z.string(),
  anomalyType: z.enum(['PRICE_SURGE', 'PRICE_DROP', 'VOLUME_SPIKE', 'VOLATILITY_EXPANSION']),
  deviationMagnitudeSigma: z.number(),
  observedMetricValue: z.number(),
  baselineMetricValue: z.number(),
  correlatedNews: z.array(
    z.object({
      title: z.string(),
      source: z.string(),
      publishedAt: z.string(),
      relevanceScore: z.number(),
      url: z.string(),
    })
  ),
  correlatedFilings: z.array(
    z.object({
      formType: z.string(),
      filingDate: z.string(),
      description: z.string(),
      url: z.string(),
    })
  ),
  synthesis: z.string(),
  regulatoryNotice: z.string().default('Informational analysis only. Not investment or financial advice.'),
  toolCalls: z.array(ToolCallLogSchema),
  usage: TokenUsageSchema,
});

export type AnomalyExplanationReport = z.infer<typeof AnomalyExplanationReportSchema>;

// 6. Backtest Strategy Spec and Assistant Schema
export const BacktestRuleConditionSchema = z.object({
  indicator: z.enum(['SMA', 'EMA', 'RSI', 'PRICE', 'VOLUME']),
  params: z.record(z.string(), z.number()).default({}),
  operator: z.enum(['gt', 'lt', 'crosses_above', 'crosses_below']),
  threshold: z.number(),
});

export type BacktestRuleCondition = z.infer<typeof BacktestRuleConditionSchema>;

export const StrategySpecSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  timeframe: z.string().default('1d'),
  entryConditions: z.array(BacktestRuleConditionSchema),
  exitConditions: z.array(BacktestRuleConditionSchema),
  stopLossPercent: z.number().optional(),
  takeProfitPercent: z.number().optional(),
  initialCapital: z.number().positive().default(100000),
  slippageBasisPoints: z.number().default(5),
});

export type StrategySpec = z.infer<typeof StrategySpecSchema>;

export const TradeRecordSchema = z.object({
  id: z.string(),
  entryDate: z.string(),
  entryPrice: z.number(),
  exitDate: z.string(),
  exitPrice: z.number(),
  shares: z.number(),
  pnl: z.number(),
  pnlPercent: z.number(),
  holdingPeriodDays: z.number(),
  exitReason: z.enum(['signal', 'stop_loss', 'take_profit', 'end_of_period']),
});

export type TradeRecord = z.infer<typeof TradeRecordSchema>;

export const BacktestExecutionReportSchema = z.object({
  strategyName: z.string(),
  symbol: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  initialCapital: z.number(),
  endingCapital: z.number(),
  totalReturnPercent: z.number(),
  annualizedReturnPercent: z.number(),
  maxDrawdownPercent: z.number(),
  sharpeRatio: z.number(),
  winRatePercent: z.number(),
  profitFactor: z.number(),
  totalTrades: z.number(),
  winningTrades: z.number(),
  losingTrades: z.number(),
  trades: z.array(TradeRecordSchema),
  equityCurve: z.array(
    z.object({
      date: z.string(),
      equity: z.number(),
      drawdownPercent: z.number(),
    })
  ),
  regulatoryNotice: z.string().default('Past performance is deterministic backtest simulation only. Not investment advice.'),
});

export type BacktestExecutionReport = z.infer<typeof BacktestExecutionReportSchema>;

export const BacktestAssistantResponseSchema = z.object({
  strategySpec: StrategySpecSchema,
  explanation: z.string(),
  backtestResult: BacktestExecutionReportSchema,
  promptVersion: z.string(),
  usage: TokenUsageSchema,
});

export type BacktestAssistantResponse = z.infer<typeof BacktestAssistantResponseSchema>;
