import type { FastifyPluginAsync } from 'fastify';
import type { IMarketDataProvider } from '../../providers/market-data.interface';
import { ScreenerQuerySchema, type ScreenerPreset } from '@stockan/shared';

const DEFAULT_PRESETS: ScreenerPreset[] = [
  {
    id: 'large-cap-tech',
    name: 'Large Cap Tech Leaders',
    description: 'Technology companies with market capitalization greater than $500B',
    query: {
      criteria: [
        { field: 'sector', operator: 'eq', value: 'Technology' },
        { field: 'marketCap', operator: 'gte', value: 500000000000 },
      ],
      sortBy: 'marketCap',
      sortDirection: 'desc',
      limit: 25,
      offset: 0,
    },
  },
  {
    id: 'value-dividends',
    name: 'Value & Dividend Yield',
    description: 'P/E less than 20 with dividend yield greater than 1.5%',
    query: {
      criteria: [
        { field: 'peRatioTTM', operator: 'lt', value: 20 },
        { field: 'dividendYield', operator: 'gt', value: 1.5 },
      ],
      sortBy: 'dividendYield',
      sortDirection: 'desc',
      limit: 25,
      offset: 0,
    },
  },
  {
    id: 'growth-roe',
    name: 'High Return on Equity',
    description: 'Companies with ROE greater than 25% and positive net profit margins',
    query: {
      criteria: [
        { field: 'returnOnEquity', operator: 'gte', value: 25 },
        { field: 'profitMargin', operator: 'gt', value: 15 },
      ],
      sortBy: 'returnOnEquity',
      sortDirection: 'desc',
      limit: 25,
      offset: 0,
    },
  },
];

export const screenerRoutes = (marketProvider: IMarketDataProvider): FastifyPluginAsync => {
  return async (app) => {
    // Run screener query
    app.post('/run', async (req) => {
      const parsed = ScreenerQuerySchema.parse(req.body ?? {});
      const result = await marketProvider.screen(parsed);
      return {
        success: true,
        data: result,
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      };
    });

    // Presets
    app.get('/presets', async (req) => {
      return {
        success: true,
        data: DEFAULT_PRESETS,
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      };
    });
  };
};
