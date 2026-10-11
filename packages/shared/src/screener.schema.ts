import { z } from 'zod';

export const FilterOperatorSchema = z.enum([
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'between',
  'in',
  'contains',
]);

export type FilterOperator = z.infer<typeof FilterOperatorSchema>;

export const ScreenerMetricFieldSchema = z.enum([
  'price',
  'changePercent',
  'volume',
  'marketCap',
  'peRatioTTM',
  'forwardPE',
  'psRatio',
  'pbRatio',
  'dividendYield',
  'returnOnEquity',
  'debtToEquity',
  'profitMargin',
  'beta',
  'sector',
  'industry',
  'rsi14',
  'sma50AboveSma200',
]);

export type ScreenerMetricField = z.infer<typeof ScreenerMetricFieldSchema>;

export const ScreenerCriterionSchema = z.object({
  field: ScreenerMetricFieldSchema,
  operator: FilterOperatorSchema,
  value: z.union([z.number(), z.string(), z.array(z.union([z.number(), z.string()]))]),
});

export type ScreenerCriterion = z.infer<typeof ScreenerCriterionSchema>;

export const ScreenerQuerySchema = z.object({
  criteria: z.array(ScreenerCriterionSchema).default([]),
  sortBy: ScreenerMetricFieldSchema.default('marketCap'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().int().min(1).max(200).default(50),
  offset: z.number().int().min(0).default(0),
});

export type ScreenerQuery = z.infer<typeof ScreenerQuerySchema>;

export const ScreenerResultRowSchema = z.object({
  symbol: z.string(),
  companyName: z.string(),
  sector: z.string(),
  price: z.number(),
  changePercent: z.number(),
  volume: z.number(),
  marketCap: z.number(),
  peRatioTTM: z.number().nullable().optional(),
  forwardPE: z.number().nullable().optional(),
  psRatio: z.number().nullable().optional(),
  pbRatio: z.number().nullable().optional(),
  dividendYield: z.number().optional(),
  profitMargin: z.number().optional(),
  returnOnEquity: z.number().optional(),
  debtToEquity: z.number().optional(),
  beta: z.number().optional(),
  rsi14: z.number().optional(),
});

export type ScreenerResultRow = z.infer<typeof ScreenerResultRowSchema>;

export const ScreenerResultSchema = z.object({
  items: z.array(ScreenerResultRowSchema),
  totalCount: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export type ScreenerResult = z.infer<typeof ScreenerResultSchema>;

export const ScreenerPresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  query: ScreenerQuerySchema,
});

export type ScreenerPreset = z.infer<typeof ScreenerPresetSchema>;
