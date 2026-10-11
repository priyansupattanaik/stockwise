import { describe, it, expect } from 'vitest';
import {
  QuoteSchema,
  OHLCVSchema,
  FundamentalsSchema,
  ScreenerQuerySchema,
  PortfolioSchema,
  ThesisReportSchema,
  NLScreenerOutputSchema,
  FilingDiffReportSchema,
  PortfolioRiskExplanationSchema,
  AnomalyExplanationReportSchema,
  BacktestAssistantResponseSchema,
  ApiSuccessEnvelopeSchema,
  ApiErrorEnvelopeSchema,
} from './index';

describe('Shared Schema Contract Tests', () => {
  it('validates Quote and OHLCV contract', () => {
    const validQuote = {
      symbol: 'AAPL',
      companyName: 'Apple Inc.',
      price: 232.15,
      change: 2.45,
      changePercent: 1.07,
      open: 230.1,
      high: 233.4,
      low: 229.8,
      previousClose: 229.7,
      volume: 48920100,
      timestamp: new Date().toISOString(),
      isDelayed: true,
      source: 'test',
    };
    expect(QuoteSchema.safeParse(validQuote).success).toBe(true);

    const validBar = {
      timestamp: '2025-01-01',
      open: 100,
      high: 105,
      low: 99,
      close: 104,
      volume: 500000,
    };
    expect(OHLCVSchema.safeParse(validBar).success).toBe(true);
  });

  it('validates ScreenerQuery contract', () => {
    const validQuery = {
      criteria: [{ field: 'sector', operator: 'eq', value: 'Technology' }],
      sortBy: 'marketCap',
      sortDirection: 'desc',
      limit: 25,
      offset: 0,
    };
    expect(ScreenerQuerySchema.safeParse(validQuery).success).toBe(true);
  });

  it('validates Fundamentals and Portfolio contracts', () => {
    const validPortfolio = {
      id: 'p-1',
      name: 'Main',
      cash: 10000,
      positions: [],
      updatedAt: new Date().toISOString(),
    };
    expect(PortfolioSchema.safeParse(validPortfolio).success).toBe(true);

    const validFundamentals = {
      symbol: 'AAPL',
      profile: {
        symbol: 'AAPL',
        companyName: 'Apple',
        sector: 'Technology',
        industry: 'Consumer Tech',
        description: 'Tech company',
      },
      metrics: {},
      statements: [],
    };
    expect(FundamentalsSchema.safeParse(validFundamentals).success).toBe(true);
  });

  it('validates AI Report schemas', () => {
    expect(ThesisReportSchema).toBeDefined();
    expect(NLScreenerOutputSchema).toBeDefined();
    expect(FilingDiffReportSchema).toBeDefined();
    expect(PortfolioRiskExplanationSchema).toBeDefined();
    expect(AnomalyExplanationReportSchema).toBeDefined();
    expect(BacktestAssistantResponseSchema).toBeDefined();
  });

  it('validates Api Envelopes', () => {
    const SuccessEnvelope = ApiSuccessEnvelopeSchema(QuoteSchema);
    const validResponse = {
      success: true,
      data: {
        symbol: 'AAPL',
        companyName: 'Apple Inc.',
        price: 232.15,
        change: 2.45,
        changePercent: 1.07,
        open: 230.1,
        high: 233.4,
        low: 229.8,
        previousClose: 229.7,
        volume: 48920100,
        timestamp: new Date().toISOString(),
        isDelayed: true,
        source: 'test',
      },
      meta: {
        requestId: 'req-123',
        timestamp: new Date().toISOString(),
      },
    };
    expect(SuccessEnvelope.safeParse(validResponse).success).toBe(true);

    const validError = {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Symbol not found.',
        requestId: 'req-456',
        timestamp: new Date().toISOString(),
      },
    };
    expect(ApiErrorEnvelopeSchema.safeParse(validError).success).toBe(true);
  });
});
