import type { FastifyPluginAsync } from 'fastify';
import type { IMarketDataProvider } from '../../providers/market-data.interface';
import { HistoryIntervalSchema, HistoryRangeSchema } from '@stockan/shared';

export const marketRoutes = (marketProvider: IMarketDataProvider): FastifyPluginAsync => {
  return async (app) => {
    // Quote
    app.get('/quote/:symbol', async (req) => {
      const { symbol } = req.params as { symbol: string };
      const quote = await marketProvider.getQuote(symbol);
      return {
        success: true,
        data: quote,
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
          isStale: false,
        },
      };
    });

    // History
    app.get('/history/:symbol', async (req) => {
      const { symbol } = req.params as { symbol: string };
      const query = req.query as { interval?: string; range?: string };

      const intervalParsed = HistoryIntervalSchema.safeParse(query.interval ?? '1d');
      const rangeParsed = HistoryRangeSchema.safeParse(query.range ?? '1y');

      const bars = await marketProvider.getHistory(
        symbol,
        intervalParsed.success ? intervalParsed.data : '1d',
        rangeParsed.success ? rangeParsed.data : '1y'
      );

      return {
        success: true,
        data: bars,
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      };
    });

    // Fundamentals
    app.get('/fundamentals/:symbol', async (req) => {
      const { symbol } = req.params as { symbol: string };
      const fundamentals = await marketProvider.getFundamentals(symbol);
      return {
        success: true,
        data: fundamentals,
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      };
    });

    // Earnings
    app.get('/earnings', async (req) => {
      const earnings = await marketProvider.getEarnings();
      return {
        success: true,
        data: earnings,
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      };
    });

    // News
    app.get('/news', async (req) => {
      const { symbol } = req.query as { symbol?: string };
      const news = await marketProvider.getNews(symbol);
      return {
        success: true,
        data: news,
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      };
    });

    // Filings
    app.get('/filings/:symbol', async (req) => {
      const { symbol } = req.params as { symbol: string };
      const filings = await marketProvider.getFilings(symbol);
      return {
        success: true,
        data: filings,
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      };
    });
  };
};
