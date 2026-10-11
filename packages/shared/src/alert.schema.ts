import { z } from 'zod';

export const AlertTypeSchema = z.enum([
  'PRICE_ABOVE',
  'PRICE_BELOW',
  'PERCENT_CHANGE',
  'VOLUME_SPIKE',
  'RSI_OVERBOUGHT',
  'RSI_OVERSOLD',
  'EARNINGS_UPCOMING',
]);

export type AlertType = z.infer<typeof AlertTypeSchema>;

export const AlertRuleSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  type: AlertTypeSchema,
  threshold: z.number(),
  timeframe: z.string().optional(), // e.g. "1d", "14d"
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  lastTriggeredAt: z.string().nullable().optional(),
});

export type AlertRule = z.infer<typeof AlertRuleSchema>;

export const AlertNotificationSchema = z.object({
  id: z.string(),
  ruleId: z.string(),
  symbol: z.string(),
  type: AlertTypeSchema,
  triggerValue: z.number(),
  threshold: z.number(),
  message: z.string(),
  timestamp: z.string(),
  isRead: z.boolean().default(false),
});

export type AlertNotification = z.infer<typeof AlertNotificationSchema>;

export const CreateAlertRequestSchema = z.object({
  symbol: z.string().min(1).max(10),
  type: AlertTypeSchema,
  threshold: z.number(),
  timeframe: z.string().optional(),
});

export type CreateAlertRequest = z.infer<typeof CreateAlertRequestSchema>;
