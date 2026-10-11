import type { FastifyPluginAsync } from 'fastify';
import type { IMarketDataProvider } from '../../providers/market-data.interface';
import type { Watchlist } from '@stockwise/shared';
import { CreateWatchlistRequestSchema } from '@stockwise/shared';
import { NotFoundError } from '../../core/errors';
import { randomUUID } from 'crypto';

// In-memory data store with default seed
const watchlistsStore: Map<string, Watchlist> = new Map([
  [
    'wl-default',
    {
      id: 'wl-default',
      name: 'Core Tech & Leaders',
      description: 'Benchmark mega-cap equities for daily monitoring',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      items: [
        { symbol: 'AAPL', addedAt: '2025-01-01T00:00:00Z' },
        { symbol: 'MSFT', addedAt: '2025-01-01T00:00:00Z' },
        { symbol: 'NVDA', addedAt: '2025-01-01T00:00:00Z' },
      ],
    },
  ],
  [
    'wl-value',
    {
      id: 'wl-value',
      name: 'Defensive & Income',
      description: 'Dividend payers and lower volatility defensive holdings',
      createdAt: '2025-01-02T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
      items: [
        { symbol: 'JNJ', addedAt: '2025-01-02T00:00:00Z' },
        { symbol: 'JPM', addedAt: '2025-01-02T00:00:00Z' },
      ],
    },
  ],
]);

export const watchlistRoutes = (marketProvider: IMarketDataProvider): FastifyPluginAsync => {
  return async (app) => {
    // List watchlists with fresh quotes
    app.get('/', async (req) => {
      const lists = Array.from(watchlistsStore.values());

      // Hydrate with latest quotes
      const hydrated = await Promise.all(
        lists.map(async (wl) => {
          const itemsWithQuotes = await Promise.all(
            wl.items.map(async (item) => {
              try {
                const quote = await marketProvider.getQuote(item.symbol);
                return { ...item, quote };
              } catch {
                return item;
              }
            })
          );
          return { ...wl, items: itemsWithQuotes };
        })
      );

      return {
        success: true,
        data: hydrated,
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      };
    });

    // Create watchlist
    app.post('/', async (req) => {
      const parsed = CreateWatchlistRequestSchema.parse(req.body);
      const id = `wl-${randomUUID().slice(0, 8)}`;
      const now = new Date().toISOString();

      const newWatchlist: Watchlist = {
        id,
        name: parsed.name,
        description: parsed.description,
        createdAt: now,
        updatedAt: now,
        items: parsed.symbols.map((sym) => ({
          symbol: sym.toUpperCase(),
          addedAt: now,
        })),
      };

      watchlistsStore.set(id, newWatchlist);

      return {
        success: true,
        data: newWatchlist,
        meta: {
          requestId: req.requestId,
          timestamp: now,
        },
      };
    });

    // Add item to watchlist
    app.post('/:id/items', async (req) => {
      const { id } = req.params as { id: string };
      const body = req.body as { symbol: string; notes?: string };
      const wl = watchlistsStore.get(id);
      if (!wl) {
        throw new NotFoundError('Watchlist', id);
      }

      const sym = body.symbol.toUpperCase();
      const exists = wl.items.some((i) => i.symbol === sym);
      if (!exists) {
        wl.items.push({
          symbol: sym,
          addedAt: new Date().toISOString(),
          notes: body.notes,
        });
        wl.updatedAt = new Date().toISOString();
      }

      return {
        success: true,
        data: wl,
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      };
    });

    // Remove item from watchlist
    app.delete('/:id/items/:symbol', async (req) => {
      const { id, symbol } = req.params as { id: string; symbol: string };
      const wl = watchlistsStore.get(id);
      if (!wl) {
        throw new NotFoundError('Watchlist', id);
      }

      wl.items = wl.items.filter((i) => i.symbol.toUpperCase() !== symbol.toUpperCase());
      wl.updatedAt = new Date().toISOString();

      return {
        success: true,
        data: wl,
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      };
    });
  };
};
