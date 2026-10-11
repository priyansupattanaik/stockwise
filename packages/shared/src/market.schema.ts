import { z } from 'zod';

export const SymbolParamSchema = z.object({
  symbol: z
    .string()
    .min(1)
    .max(10)
    .regex(/^[A-Z0-9.-]+$/, 'Symbol must be valid uppercase alphanumeric ticker'),
});

export const QuoteSchema = z.object({
  symbol: z.string(),
  companyName: z.string(),
  price: z.number(),
  change: z.number(),
  changePercent: z.number(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  previousClose: z.number(),
  volume: z.number(),
  avgVolume: z.number().optional(),
  marketCap: z.number().optional(),
  peRatio: z.number().nullable().optional(),
  week52High: z.number().optional(),
  week52Low: z.number().optional(),
  timestamp: z.string(),
  isDelayed: z.boolean().default(true),
  source: z.string(),
});

export type Quote = z.infer<typeof QuoteSchema>;

export const OHLCVSchema = z.object({
  timestamp: z.string(), // ISO date string or YYYY-MM-DD
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
});

export type OHLCV = z.infer<typeof OHLCVSchema>;

export const HistoryIntervalSchema = z.enum(['1d', '1wk', '1mo']);
export type HistoryInterval = z.infer<typeof HistoryIntervalSchema>;

export const HistoryRangeSchema = z.enum(['1m', '3m', '6m', '1y', '5y', 'max']);
export type HistoryRange = z.infer<typeof HistoryRangeSchema>;

export const CompanyProfileSchema = z.object({
  symbol: z.string(),
  companyName: z.string(),
  sector: z.string(),
  industry: z.string(),
  description: z.string(),
  ceo: z.string().optional(),
  employees: z.number().optional(),
  headquarters: z.string().optional(),
  website: z.string().optional(),
});

export type CompanyProfile = z.infer<typeof CompanyProfileSchema>;

export const FinancialPeriodSchema = z.enum(['annual', 'quarterly']);
export type FinancialPeriod = z.infer<typeof FinancialPeriodSchema>;

export const FinancialStatementItemSchema = z.object({
  period: z.string(), // e.g. "2024-Q3" or "2023"
  date: z.string(),
  revenue: z.number(),
  grossProfit: z.number().optional(),
  operatingIncome: z.number().optional(),
  netIncome: z.number(),
  eps: z.number().nullable().optional(),
  totalAssets: z.number().optional(),
  totalLiabilities: z.number().optional(),
  totalDebt: z.number().optional(),
  freeCashFlow: z.number().optional(),
  operatingCashFlow: z.number().optional(),
});

export type FinancialStatementItem = z.infer<typeof FinancialStatementItemSchema>;

export const FundamentalsSchema = z.object({
  symbol: z.string(),
  profile: CompanyProfileSchema,
  metrics: z.object({
    peRatioTTM: z.number().nullable().optional(),
    forwardPE: z.number().nullable().optional(),
    pbRatio: z.number().nullable().optional(),
    psRatio: z.number().nullable().optional(),
    evToEbitda: z.number().nullable().optional(),
    profitMargin: z.number().optional(),
    operatingMargin: z.number().optional(),
    returnOnEquity: z.number().optional(),
    debtToEquity: z.number().optional(),
    dividendYield: z.number().optional(),
    beta: z.number().optional(),
  }),
  statements: z.array(FinancialStatementItemSchema),
});

export type Fundamentals = z.infer<typeof FundamentalsSchema>;

export const EarningsItemSchema = z.object({
  symbol: z.string(),
  companyName: z.string(),
  reportDate: z.string(),
  timeOfDay: z.enum(['bmo', 'amc', 'dmh']), // before market open, after market close, during market hours
  estimatedEPS: z.number().nullable().optional(),
  actualEPS: z.number().nullable().optional(),
  estimatedRevenue: z.number().nullable().optional(),
  actualRevenue: z.number().nullable().optional(),
  currency: z.string().default('USD'),
});

export type EarningsItem = z.infer<typeof EarningsItemSchema>;

export const NewsItemSchema = z.object({
  id: z.string(),
  symbol: z.string().optional(),
  title: z.string(),
  summary: z.string(),
  source: z.string(),
  url: z.string(),
  publishedAt: z.string(),
  sentimentScore: z.number().min(-1).max(1).optional(),
});

export type NewsItem = z.infer<typeof NewsItemSchema>;

export const FilingSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  formType: z.string(), // "10-K", "10-Q", "8-K"
  filingDate: z.string(),
  reportDate: z.string(),
  description: z.string(),
  url: z.string(),
  keyMetrics: z.record(z.string(), z.union([z.number(), z.string()])).optional(),
});

export type Filing = z.infer<typeof FilingSchema>;
