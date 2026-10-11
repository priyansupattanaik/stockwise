import type {
  ScreenerCriterion,
  Position,
} from '@stockwise/shared';

export interface ThesisEvalFixture {
  symbol: string;
  expectedSufficiency: 'sufficient' | 'insufficient_data';
  expectedMinCitations: number;
  expectedMinBullPoints: number;
  expectedMinBearPoints: number;
}

export interface NLScreenerEvalFixture {
  prompt: string;
  expectedCriteria: ScreenerCriterion[];
  expectedSortBy: string;
  expectedSortDirection: 'asc' | 'desc';
}

export interface FilingDiffEvalFixture {
  symbol: string;
  expectedSufficiency: 'sufficient' | 'insufficient_data';
  expectedMinChanges: number;
}

export interface PortfolioRiskEvalFixture {
  portfolioId: string;
  positions: Position[];
  expectedTopHoldingSymbol: string;
}

export interface AnomalyEvalFixture {
  symbol: string;
  expectedMinSigma: number;
  expectedMinCorrelatedFilings: number;
}

export interface BacktestEvalFixture {
  symbol: string;
  prompt: string;
  expectedIndicator: 'SMA' | 'RSI';
  expectedEntryOperator: 'crosses_above' | 'lt';
}

export const AI_EVAL_FIXTURES = {
  thesis: [
    {
      symbol: 'AAPL',
      expectedSufficiency: 'sufficient' as const,
      expectedMinCitations: 5,
      expectedMinBullPoints: 2,
      expectedMinBearPoints: 2,
    },
    {
      symbol: 'UNKNOWN99',
      expectedSufficiency: 'insufficient_data' as const,
      expectedMinCitations: 0,
      expectedMinBullPoints: 0,
      expectedMinBearPoints: 0,
    },
  ],
  nlScreener: [
    {
      prompt: 'Tech stocks with low PE and dividend yield',
      expectedCriteria: [
        { field: 'sector', operator: 'eq', value: 'Technology' },
        { field: 'peRatioTTM', operator: 'lt', value: 25 },
        { field: 'dividendYield', operator: 'gt', value: 1.5 },
      ],
      expectedSortBy: 'dividendYield',
      expectedSortDirection: 'desc' as const,
    },
    {
      prompt: 'Mega cap healthcare stocks with defensive beta',
      expectedCriteria: [
        { field: 'sector', operator: 'eq', value: 'Healthcare' },
        { field: 'marketCap', operator: 'gte', value: 200000000000 },
        { field: 'beta', operator: 'lt', value: 1.0 },
      ],
      expectedSortBy: 'marketCap',
      expectedSortDirection: 'desc' as const,
    },
  ],
  filingDiff: [
    {
      symbol: 'AAPL',
      expectedSufficiency: 'sufficient' as const,
      expectedMinChanges: 2,
    },
    {
      symbol: 'UNKNOWN99',
      expectedSufficiency: 'insufficient_data' as const,
      expectedMinChanges: 0,
    },
  ],
  portfolioRisk: [
    {
      portfolioId: 'test-golden-portfolio',
      positions: [
        {
          id: 'pos-aapl',
          symbol: 'AAPL',
          companyName: 'Apple Inc.',
          shares: 200,
          averageCost: 180,
          currentPrice: 230,
          marketValue: 46000,
          unrealizedGain: 10000,
          unrealizedGainPercent: 27.78,
          weightPercent: 46.0,
          sector: 'Technology',
        },
        {
          id: 'pos-msft',
          symbol: 'MSFT',
          companyName: 'Microsoft Corporation',
          shares: 75,
          averageCost: 400,
          currentPrice: 420,
          marketValue: 31500,
          unrealizedGain: 1500,
          unrealizedGainPercent: 5.0,
          weightPercent: 31.5,
          sector: 'Technology',
        },
        {
          id: 'pos-jnj',
          symbol: 'JNJ',
          companyName: 'Johnson & Johnson',
          shares: 140,
          averageCost: 155,
          currentPrice: 161,
          marketValue: 22540,
          unrealizedGain: 840,
          unrealizedGainPercent: 3.87,
          weightPercent: 22.5,
          sector: 'Healthcare',
        },
      ],
      expectedTopHoldingSymbol: 'AAPL',
    },
  ],
  anomaly: [
    {
      symbol: 'NVDA',
      expectedMinSigma: 0,
      expectedMinCorrelatedFilings: 1,
    },
    {
      symbol: 'MSFT',
      expectedMinSigma: 0,
      expectedMinCorrelatedFilings: 1,
    },
  ],
  backtest: [
    {
      symbol: 'AAPL',
      prompt: 'Buy when 20-day SMA crosses above price, sell when it drops below',
      expectedIndicator: 'SMA' as const,
      expectedEntryOperator: 'crosses_above' as const,
    },
    {
      symbol: 'MSFT',
      prompt: 'Buy when RSI drops below 30 and oversold, exit when RSI above 70',
      expectedIndicator: 'RSI' as const,
      expectedEntryOperator: 'lt' as const,
    },
  ],
};
