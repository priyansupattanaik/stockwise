import type { FastifyPluginAsync } from 'fastify';
import type { IMarketDataProvider } from '../../providers/market-data.interface';
import type { Portfolio, Position } from '@stockwise/shared';
import { calculateFullPortfolioRisk } from '@stockwise/analytics';
import { NotFoundError } from '../../core/errors';
import { randomUUID } from 'crypto';

let userPortfolio: Portfolio = {
  id: 'portfolio-main',
  name: 'Core Growth & Strategic',
  cash: 25000,
  updatedAt: new Date().toISOString(),
  positions: [
    {
      id: 'pos-1',
      symbol: 'AAPL',
      companyName: 'Apple Inc.',
      sector: 'Technology',
      shares: 120,
      averageCost: 195.4,
      currentPrice: 232.15,
      marketValue: 27858,
      unrealizedGain: 4410,
      unrealizedGainPercent: 18.81,
      weightPercent: 33.4,
    },
    {
      id: 'pos-2',
      symbol: 'MSFT',
      companyName: 'Microsoft Corporation',
      sector: 'Technology',
      shares: 60,
      averageCost: 380.0,
      currentPrice: 418.5,
      marketValue: 25110,
      unrealizedGain: 2310,
      unrealizedGainPercent: 10.13,
      weightPercent: 30.1,
    },
    {
      id: 'pos-3',
      symbol: 'NVDA',
      companyName: 'NVIDIA Corporation',
      sector: 'Technology',
      shares: 110,
      averageCost: 95.0,
      currentPrice: 138.25,
      marketValue: 15207.5,
      unrealizedGain: 4757.5,
      unrealizedGainPercent: 45.52,
      weightPercent: 18.23,
    },
    {
      id: 'pos-4',
      symbol: 'JPM',
      companyName: 'JPMorgan Chase & Co.',
      sector: 'Financial Services',
      shares: 63,
      averageCost: 200.0,
      currentPrice: 242.1,
      marketValue: 15252.3,
      unrealizedGain: 2652.3,
      unrealizedGainPercent: 21.05,
      weightPercent: 18.27,
    },
  ],
};

async function refreshPortfolio(marketProvider: IMarketDataProvider): Promise<Portfolio> {
  const updatedPositions: Position[] = [];

  for (const pos of userPortfolio.positions) {
    try {
      const q = await marketProvider.getQuote(pos.symbol);
      const curPrice = q.price;
      const marketVal = Number((pos.shares * curPrice).toFixed(2));
      const gain = Number((marketVal - pos.shares * pos.averageCost).toFixed(2));
      const gainPct = Number(((gain / (pos.shares * pos.averageCost)) * 100).toFixed(2));

      updatedPositions.push({
        ...pos,
        currentPrice: curPrice,
        marketValue: marketVal,
        unrealizedGain: gain,
        unrealizedGainPercent: gainPct,
      });
    } catch {
      updatedPositions.push(pos);
    }
  }

  const totalValue = updatedPositions.reduce((acc, p) => acc + p.marketValue, 0);

  // Recalculate weights
  for (const pos of updatedPositions) {
    pos.weightPercent =
      totalValue > 0 ? Number(((pos.marketValue / totalValue) * 100).toFixed(2)) : 0;
  }

  userPortfolio.positions = updatedPositions;
  userPortfolio.updatedAt = new Date().toISOString();
  return userPortfolio;
}

export const portfolioRoutes = (marketProvider: IMarketDataProvider): FastifyPluginAsync => {
  return async (app) => {
    // Get Portfolio
    app.get('/', async (req) => {
      const refreshed = await refreshPortfolio(marketProvider);
      return {
        success: true,
        data: refreshed,
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      };
    });

    // Add Position
    app.post('/positions', async (req) => {
      const body = req.body as {
        symbol: string;
        shares: number;
        averageCost: number;
      };

      const sym = body.symbol.toUpperCase();
      const quote = await marketProvider.getQuote(sym);
      const fundamentals = await marketProvider.getFundamentals(sym).catch(() => null);

      const shares = Number(body.shares);
      const avgCost = Number(body.averageCost);
      const marketVal = Number((shares * quote.price).toFixed(2));
      const gain = Number((marketVal - shares * avgCost).toFixed(2));
      const gainPct = Number(((gain / (shares * avgCost)) * 100).toFixed(2));

      const newPos: Position = {
        id: `pos-${randomUUID().slice(0, 8)}`,
        symbol: sym,
        companyName: quote.companyName,
        sector: fundamentals?.profile.sector ?? 'Technology',
        shares,
        averageCost: avgCost,
        currentPrice: quote.price,
        marketValue: marketVal,
        unrealizedGain: gain,
        unrealizedGainPercent: gainPct,
        weightPercent: 0,
      };

      userPortfolio.positions.push(newPos);
      const refreshed = await refreshPortfolio(marketProvider);

      return {
        success: true,
        data: refreshed,
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      };
    });

    // Delete Position
    app.delete('/positions/:id', async (req) => {
      const { id } = req.params as { id: string };
      const initialLen = userPortfolio.positions.length;
      userPortfolio.positions = userPortfolio.positions.filter((p) => p.id !== id);

      if (userPortfolio.positions.length === initialLen) {
        throw new NotFoundError('Portfolio position', id);
      }

      const refreshed = await refreshPortfolio(marketProvider);
      return {
        success: true,
        data: refreshed,
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      };
    });

    // Calculate Portfolio Risk
    app.get('/risk', async (req) => {
      const portfolio = await refreshPortfolio(marketProvider);

      // Generate synthetic historical portfolio returns based on weighted holdings
      const days = 120;
      const benchmarkReturns: number[] = Array.from(
        { length: days },
        (_, i) => Math.sin(i / 6) * 0.012 + (i % 2 === 0 ? 0.003 : -0.002)
      );

      const returnsBySymbol: Record<string, number[]> = {};
      for (const pos of portfolio.positions) {
        returnsBySymbol[pos.symbol] = Array.from(
          { length: days },
          (_, i) => Math.sin(i / 5 + pos.symbol.charCodeAt(0)) * 0.018 + 0.001
        );
      }

      // Weighted portfolio return
      const portfolioReturns: number[] = [];
      for (let d = 0; d < days; d++) {
        let dailyRet = 0;
        for (const pos of portfolio.positions) {
          const symRet = returnsBySymbol[pos.symbol]?.[d] ?? 0;
          dailyRet += symRet * (pos.weightPercent / 100);
        }
        portfolioReturns.push(dailyRet);
      }

      const risk = calculateFullPortfolioRisk(
        portfolio.positions,
        portfolioReturns,
        benchmarkReturns,
        returnsBySymbol
      );

      return {
        success: true,
        data: risk,
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      };
    });
  };
};
