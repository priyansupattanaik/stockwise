import type { FastifyPluginAsync } from 'fastify';
import { AIService } from './ai.service';
import { ValidationError } from '../../core/errors';

export const aiRoutes = (aiService: AIService): FastifyPluginAsync => {
  return async (app) => {
    // 1. Thesis Builder
    app.get('/thesis/:symbol', async (req) => {
      const { symbol } = req.params as { symbol: string };
      const thesis = await aiService.buildThesis(symbol);
      return {
        success: true,
        data: thesis,
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      };
    });

    // 2. Natural-Language Screener
    app.post('/screener', async (req) => {
      const body = req.body as { query: string };
      if (!body?.query || typeof body.query !== 'string') {
        throw new ValidationError('A non-empty string query parameter is required.');
      }
      const output = await aiService.parseNLScreenerQuery(body.query);
      return {
        success: true,
        data: output,
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      };
    });

    // 3. Filing and Earnings Diff
    app.get('/filing-diff/:symbol', async (req) => {
      const { symbol } = req.params as { symbol: string };
      const diff = await aiService.diffFilings(symbol);
      return {
        success: true,
        data: diff,
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      };
    });

    // 4. Portfolio Risk Analysis
    app.post('/portfolio-risk', async (req) => {
      const body = req.body as {
        portfolioId: string;
        positions: any[];
      };
      if (!body?.portfolioId || !Array.isArray(body?.positions)) {
        throw new ValidationError('portfolioId and positions array are required.');
      }

      // Generate synthetic historical returns
      const days = 100;
      const benchmarkReturns = Array.from({ length: days }, (_, i) => Math.sin(i / 5) * 0.01);
      const returnsBySymbol: Record<string, number[]> = {};
      for (const pos of body.positions) {
        returnsBySymbol[pos.symbol] = Array.from(
          { length: days },
          (_, i) => Math.sin(i / 4 + pos.symbol.charCodeAt(0)) * 0.015
        );
      }
      const historicalReturns = Array.from({ length: days }, (_, i) => Math.sin(i / 5) * 0.012);

      const explanation = await aiService.explainPortfolioRisk(
        body.portfolioId,
        body.positions,
        historicalReturns,
        benchmarkReturns,
        returnsBySymbol
      );

      return {
        success: true,
        data: explanation,
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      };
    });

    // 5. Anomaly Explainer
    app.get('/anomaly/:symbol', async (req) => {
      const { symbol } = req.params as { symbol: string };
      const report = await aiService.explainAnomaly(symbol);
      return {
        success: true,
        data: report,
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      };
    });

    // 6. Backtest Assistant
    app.post('/backtest', async (req) => {
      const body = req.body as { description: string; symbol: string };
      if (!body?.description || !body?.symbol) {
        throw new ValidationError('description and symbol parameters are required.');
      }
      const result = await aiService.assistBacktest(body.description, body.symbol);
      return {
        success: true,
        data: result,
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      };
    });

    // 7. SSE Live Stream
    app.get('/stream', async (_req, reply) => {
      reply.raw.setHeader('Content-Type', 'text/event-stream');
      reply.raw.setHeader('Cache-Control', 'no-cache');
      reply.raw.setHeader('Connection', 'keep-alive');

      const sendEvent = (event: string, data: any) => {
        reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      sendEvent('connected', { status: 'connected', timestamp: new Date().toISOString() });
      sendEvent('tool_call', {
        toolName: 'get_quote',
        symbol: 'AAPL',
        status: 'executing',
      });

      setTimeout(() => {
        sendEvent('tool_result', {
          toolName: 'get_quote',
          price: 232.15,
          status: 'completed',
        });
        sendEvent('done', { status: 'finished' });
        reply.raw.end();
      }, 500);
    });
  };
};
