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

    // Live Quotes SSE Stream
    app.get('/stream', async (req, reply) => {
      const query = req.query as { symbols?: string };
      const symbolsList = query.symbols
        ? query.symbols.split(',').map((s) => s.trim().toUpperCase())
        : ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN'];

      reply.raw.setHeader('Content-Type', 'text/event-stream');
      reply.raw.setHeader('Cache-Control', 'no-cache');
      reply.raw.setHeader('Connection', 'keep-alive');

      const sendEvent = (event: string, data: any) => {
        reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      sendEvent('connected', {
        status: 'connected',
        subscribedSymbols: symbolsList,
        timestamp: new Date().toISOString(),
      });

      // Stream initial quotes
      for (const sym of symbolsList) {
        try {
          const q = await marketProvider.getQuote(sym);
          sendEvent('quote', q);
        } catch {
          // ignore
        }
      }

      const interval = setInterval(async () => {
        const randomSym = symbolsList[Math.floor(Math.random() * symbolsList.length)];
        if (!randomSym) return;
        try {
          const q = await marketProvider.getQuote(randomSym);
          const jitter = (Math.random() - 0.5) * 0.2;
          const updatedQuote = {
            ...q,
            price: Number((q.price + jitter).toFixed(2)),
            change: Number((q.change + jitter).toFixed(2)),
            changePercent: Number((((q.price + jitter - q.previousClose) / q.previousClose) * 100).toFixed(2)),
            timestamp: new Date().toISOString(),
          };
          sendEvent('quote', updatedQuote);
        } catch {
          // ignore
        }
      }, 1000);

      req.raw.on('close', () => {
        clearInterval(interval);
      });
    });
  };
};
