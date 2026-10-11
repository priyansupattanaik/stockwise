import type { FastifyPluginAsync } from 'fastify';
import type { IMarketDataProvider } from '../../providers/market-data.interface';
import type { AlertRule, AlertNotification } from '@stockan/shared';
import { CreateAlertRequestSchema } from '@stockan/shared';
import { NotFoundError } from '../../core/errors';
import { randomUUID } from 'crypto';

const alertRulesStore: Map<string, AlertRule> = new Map([
  [
    'rule-1',
    {
      id: 'rule-1',
      symbol: 'AAPL',
      type: 'PRICE_ABOVE',
      threshold: 235.0,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
    },
  ],
  [
    'rule-2',
    {
      id: 'rule-2',
      symbol: 'NVDA',
      type: 'RSI_OVERBOUGHT',
      threshold: 70.0,
      isActive: true,
      createdAt: '2025-01-02T00:00:00Z',
    },
  ],
  [
    'rule-3',
    {
      id: 'rule-3',
      symbol: 'MSFT',
      type: 'VOLUME_SPIKE',
      threshold: 25000000,
      isActive: true,
      createdAt: '2025-01-03T00:00:00Z',
    },
  ],
]);

const notificationsStore: AlertNotification[] = [
  {
    id: 'notif-1',
    ruleId: 'rule-1',
    symbol: 'AAPL',
    type: 'PRICE_ABOVE',
    triggerValue: 235.4,
    threshold: 235.0,
    message: 'AAPL traded above target price $235.00 (Current: $235.40)',
    timestamp: '2025-01-10T15:30:00Z',
    isRead: false,
  },
  {
    id: 'notif-2',
    ruleId: 'rule-2',
    symbol: 'NVDA',
    type: 'RSI_OVERBOUGHT',
    triggerValue: 72.8,
    threshold: 70.0,
    message: 'NVDA daily 14-period RSI crossed overbought threshold 70.0 (Current: 72.8)',
    timestamp: '2025-01-12T16:00:00Z',
    isRead: true,
  },
];

export const alertRoutes = (_marketProvider: IMarketDataProvider): FastifyPluginAsync => {
  return async (app) => {
    // List rules
    app.get('/', async (req) => {
      const rules = Array.from(alertRulesStore.values());
      return {
        success: true,
        data: rules,
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      };
    });

    // Create rule
    app.post('/', async (req) => {
      const parsed = CreateAlertRequestSchema.parse(req.body);
      const id = `rule-${randomUUID().slice(0, 8)}`;
      const now = new Date().toISOString();

      const rule: AlertRule = {
        id,
        symbol: parsed.symbol.toUpperCase(),
        type: parsed.type,
        threshold: parsed.threshold,
        timeframe: parsed.timeframe,
        isActive: true,
        createdAt: now,
      };

      alertRulesStore.set(id, rule);

      return {
        success: true,
        data: rule,
        meta: {
          requestId: req.requestId,
          timestamp: now,
        },
      };
    });

    // Delete rule
    app.delete('/:id', async (req) => {
      const { id } = req.params as { id: string };
      if (!alertRulesStore.has(id)) {
        throw new NotFoundError('Alert rule', id);
      }
      alertRulesStore.delete(id);
      return {
        success: true,
        data: { id, deleted: true },
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      };
    });

    // List notifications
    app.get('/notifications', async (req) => {
      return {
        success: true,
        data: notificationsStore,
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      };
    });
  };
};
