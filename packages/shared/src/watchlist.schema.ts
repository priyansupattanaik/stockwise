import { z } from 'zod';
import { QuoteSchema } from './market.schema';

export const WatchlistItemSchema = z.object({
  symbol: z.string(),
  addedAt: z.string(),
  notes: z.string().optional(),
  quote: QuoteSchema.optional(),
});

export type WatchlistItem = z.infer<typeof WatchlistItemSchema>;

export const WatchlistSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  items: z.array(WatchlistItemSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Watchlist = z.infer<typeof WatchlistSchema>;

export const CreateWatchlistRequestSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  symbols: z.array(z.string()).default([]),
});

export type CreateWatchlistRequest = z.infer<typeof CreateWatchlistRequestSchema>;
