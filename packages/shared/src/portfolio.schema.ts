import { z } from 'zod';

export const PositionSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  companyName: z.string(),
  sector: z.string(),
  shares: z.number().positive(),
  averageCost: z.number().positive(),
  currentPrice: z.number(),
  marketValue: z.number(),
  unrealizedGain: z.number(),
  unrealizedGainPercent: z.number(),
  weightPercent: z.number(), // 0 to 100
});

export type Position = z.infer<typeof PositionSchema>;

export const TransactionSchema = z.object({
  id: z.string(),
  portfolioId: z.string(),
  symbol: z.string(),
  type: z.enum(['BUY', 'SELL']),
  shares: z.number().positive(),
  price: z.number().positive(),
  totalAmount: z.number().positive(),
  timestamp: z.string(),
  notes: z.string().optional(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

export const DrawdownScenarioSchema = z.object({
  name: z.string(),
  description: z.string(),
  marketShockPercent: z.number(),
  estimatedPortfolioImpactPercent: z.number(),
  estimatedPortfolioLossValue: z.number(),
  vulnerableHoldings: z.array(z.string()),
});

export type DrawdownScenario = z.infer<typeof DrawdownScenarioSchema>;

export const MonteCarloResultSchema = z.object({
  simulationDays: z.number(),
  runsCount: z.number(),
  initialValue: z.number(),
  percentile5Value: z.number(),
  medianValue: z.number(),
  percentile95Value: z.number(),
  trajectories: z.object({
    percentile5: z.array(z.number()),
    median: z.array(z.number()),
    percentile95: z.array(z.number()),
  }),
});

export type MonteCarloResult = z.infer<typeof MonteCarloResultSchema>;

export const SectorExposureSchema = z.object({
  sector: z.string(),
  weightPercent: z.number(),
  value: z.number(),
});

export type SectorExposure = z.infer<typeof SectorExposureSchema>;

export const PortfolioRiskMetricsSchema = z.object({
  totalValue: z.number(),
  totalCost: z.number(),
  totalGain: z.number(),
  totalGainPercent: z.number(),
  beta: z.number(),
  annualizedVolatility: z.number(),
  sharpeRatio: z.number(),
  sortinoRatio: z.number(),
  maxDrawdown: z.number(),
  var95Historical: z.number(),
  cvar95Historical: z.number(),
  sectorExposures: z.array(SectorExposureSchema),
  correlationMatrix: z.record(z.string(), z.record(z.string(), z.number())),
  drawdownScenarios: z.array(DrawdownScenarioSchema),
  monteCarlo: MonteCarloResultSchema,
});

export type PortfolioRiskMetrics = z.infer<typeof PortfolioRiskMetricsSchema>;

export const PortfolioSchema = z.object({
  id: z.string(),
  name: z.string(),
  cash: z.number().min(0),
  positions: z.array(PositionSchema),
  updatedAt: z.string(),
});

export type Portfolio = z.infer<typeof PortfolioSchema>;
