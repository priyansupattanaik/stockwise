import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { registerCoreMiddleware } from './core/middleware';
import { MockMarketDataProvider } from './providers/mock-market-data.provider';
import { AIToolRegistry } from './modules/ai/ai.tool-registry';
import { AIService } from './modules/ai/ai.service';
import { marketRoutes } from './modules/market/market.routes';
import { screenerRoutes } from './modules/screener/screener.routes';
import { watchlistRoutes } from './modules/watchlist/watchlist.routes';
import { portfolioRoutes } from './modules/portfolio/portfolio.routes';
import { alertRoutes } from './modules/alert/alert.routes';
import { aiRoutes } from './modules/ai/ai.routes';
import { env } from './core/env';

export async function buildApp() {
  const app = Fastify({
    logger: false, // We use structured custom logger
  });

  // CORS
  await app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id', 'x-idempotency-key'],
  });

  // Rate Limiting
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
  });

  // Swagger Documentation
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Stockwise Platform API',
        description:
          'Institutional-grade stock market analysis platform with deterministic AI tool orchestration.',
        version: '1.0.0',
      },
      servers: [{ url: 'http://localhost:4000', description: 'Local Development Server' }],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
  });

  // Core Middleware (request ID, timing, idempotency, typed error envelope)
  registerCoreMiddleware(app);

  // Health check endpoint
  app.get('/health', async () => {
    return {
      status: 'ok',
      service: 'stockwise-api',
      timestamp: new Date().toISOString(),
      provider: env.MARKET_DATA_PROVIDER,
    };
  });

  // Providers & Services
  const marketDataProvider = new MockMarketDataProvider();
  const aiToolRegistry = new AIToolRegistry(marketDataProvider);
  const aiService = new AIService(aiToolRegistry);

  // Mount versioned REST under /v1
  await app.register(
    async (v1) => {
      await v1.register(marketRoutes(marketDataProvider), { prefix: '/market' });
      await v1.register(screenerRoutes(marketDataProvider), { prefix: '/screener' });
      await v1.register(watchlistRoutes(marketDataProvider), { prefix: '/watchlists' });
      await v1.register(portfolioRoutes(marketDataProvider), { prefix: '/portfolio' });
      await v1.register(alertRoutes(marketDataProvider), { prefix: '/alerts' });
      await v1.register(aiRoutes(aiService), { prefix: '/ai' });
    },
    { prefix: '/v1' }
  );

  return app;
}
