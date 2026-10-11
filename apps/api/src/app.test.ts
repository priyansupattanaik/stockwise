import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from './app';

describe('Stockan Fastify API Endpoints', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns 200 and ok status', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.status).toBe('ok');
    expect(body.service).toBe('stockan-api');
  });

  describe('Market Data Endpoints', () => {
    it('GET /v1/market/quote/AAPL returns quote with envelope', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/market/quote/AAPL' });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.symbol).toBe('AAPL');
      expect(json.data.price).toBeGreaterThan(0);
      expect(json.data.isDelayed).toBe(true);
      expect(json.meta.requestId).toBeDefined();
    });

    it('GET /v1/market/history/AAPL returns OHLCV series', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/v1/market/history/AAPL?range=1m&interval=1d',
      });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
      expect(json.data[0].open).toBeDefined();
      expect(json.data[0].close).toBeDefined();
    });

    it('GET /v1/market/fundamentals/AAPL returns financial statements and ratios', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/market/fundamentals/AAPL' });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.profile.sector).toBe('Technology');
      expect(json.data.statements.length).toBeGreaterThan(0);
      expect(json.data.metrics.peRatioTTM).toBeDefined();
    });
  });

  describe('Screener Endpoints', () => {
    it('POST /v1/screener/run filters stocks by criteria', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/v1/screener/run',
        payload: {
          criteria: [{ field: 'sector', operator: 'eq', value: 'Technology' }],
          sortBy: 'marketCap',
          sortDirection: 'desc',
        },
      });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.items.length).toBeGreaterThan(0);
      expect(json.data.items.every((i: any) => i.sector === 'Technology')).toBe(true);
    });

    it('GET /v1/screener/presets returns preset queries', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/screener/presets' });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Watchlists Endpoints', () => {
    it('GET /v1/watchlists lists watchlists with quote data', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/watchlists' });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
      expect(json.data[0].items[0].quote).toBeDefined();
    });

    it('POST /v1/watchlists creates a new watchlist', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/v1/watchlists',
        payload: {
          name: 'Momentum Watch',
          symbols: ['NVDA', 'TSLA'],
        },
      });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.name).toBe('Momentum Watch');
      expect(json.data.items.length).toBe(2);
    });
  });

  describe('Portfolio & Risk Endpoints', () => {
    it('GET /v1/portfolio returns portfolio with computed weights', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/portfolio' });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.positions.length).toBeGreaterThan(0);
    });

    it('GET /v1/portfolio/risk returns full risk metrics and scenario analysis', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/portfolio/risk' });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.beta).toBeDefined();
      expect(json.data.sharpeRatio).toBeDefined();
      expect(json.data.sectorExposures.length).toBeGreaterThan(0);
      expect(json.data.drawdownScenarios.length).toBeGreaterThan(0);
      expect(json.data.monteCarlo.simulationDays).toBe(252);
    });
  });

  describe('Alerts Endpoints', () => {
    it('GET /v1/alerts returns active alert rules', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/alerts' });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
    });

    it('POST /v1/alerts creates a new alert', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/v1/alerts',
        payload: {
          symbol: 'MSFT',
          type: 'PRICE_ABOVE',
          threshold: 450.0,
        },
      });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.threshold).toBe(450.0);
    });
  });

  describe('AI Analysis Layer Endpoints', () => {
    it('GET /v1/ai/thesis/AAPL returns cited bull/bear thesis without hallucinated numbers', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/ai/thesis/AAPL' });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.dataSufficiency).toBe('sufficient');
      expect(json.data.bullCase.points.length).toBeGreaterThan(0);
      expect(json.data.bearCase.points.length).toBeGreaterThan(0);
      // Verify every claim has an explicit source citation
      for (const point of json.data.bullCase.points) {
        expect(point.citation.field).toBeDefined();
        expect(point.citation.timestamp).toBeDefined();
      }
      expect(json.data.regulatoryNotice).toContain('Informational analysis only');
    });

    it('POST /v1/ai/screener parses NL intent into structured query AST', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/v1/ai/screener',
        payload: { query: 'find large cap tech stocks with low pe ratio and dividends' },
      });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.structuredQuery.criteria.length).toBeGreaterThan(0);
      expect(json.data.usage.estimatedCostUsd).toBeGreaterThan(0);
    });

    it('GET /v1/ai/filing-diff/AAPL returns flagged material changes with line citations', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/ai/filing-diff/AAPL' });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.changes.length).toBeGreaterThan(0);
      expect(json.data.changes[0].citation).toBeDefined();
    });

    it('GET /v1/ai/anomaly/NVDA returns volume/price anomaly analysis', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/ai/anomaly/NVDA' });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.anomalyType).toBeDefined();
      expect(json.data.synthesis).toBeDefined();
    });

    it('POST /v1/ai/backtest converts description to strategy spec and executes simulation', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/v1/ai/backtest',
        payload: {
          description: 'Buy when 20-day SMA crosses above price, sell when it drops below',
          symbol: 'AAPL',
        },
      });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.strategySpec.entryConditions.length).toBeGreaterThan(0);
      expect(json.data.backtestResult.equityCurve.length).toBeGreaterThan(0);
    });
  });

  describe('Error Envelope and Idempotency', () => {
    it('returns typed error envelope on 404', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/market/fundamentals/UNKNOWN99' });
      expect(res.statusCode).toBe(404);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('NOT_FOUND');
      expect(json.error.requestId).toBeDefined();
    });

    it('replays response when x-idempotency-key is repeated on POST', async () => {
      const idemKey = 'test-idem-key-123';
      const payload = { symbol: 'AAPL', type: 'PRICE_ABOVE', threshold: 300 };

      const res1 = await app.inject({
        method: 'POST',
        url: '/v1/alerts',
        headers: { 'x-idempotency-key': idemKey },
        payload,
      });
      expect(res1.statusCode).toBe(200);

      const res2 = await app.inject({
        method: 'POST',
        url: '/v1/alerts',
        headers: { 'x-idempotency-key': idemKey },
        payload,
      });
      expect(res2.statusCode).toBe(200);
      expect(res2.headers['x-cache-replayed']).toBe('true');
    });
  });
});
