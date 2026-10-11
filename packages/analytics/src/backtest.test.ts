import { describe, it, expect } from 'vitest';
import { runBacktest } from './backtest';
import type { StrategySpec, OHLCV } from '@stockan/shared';

describe('Deterministic Backtest Engine', () => {
  const sampleBars: OHLCV[] = Array.from({ length: 50 }, (_, i) => {
    // Generate a simple sinusoidal price trend
    const price = 100 + Math.sin(i / 3) * 15 + i * 0.5;
    return {
      timestamp: `2025-01-${String(i + 1).padStart(2, '0')}`,
      open: price - 0.5,
      high: price + 1.0,
      low: price - 1.0,
      close: price,
      volume: 1000000 + i * 5000,
    };
  });

  const sampleSpec: StrategySpec = {
    name: 'RSI Oversold Mean Reversion',
    symbol: 'AAPL',
    timeframe: '1d',
    initialCapital: 100000,
    slippageBasisPoints: 5,
    stopLossPercent: 8,
    takeProfitPercent: 12,
    entryConditions: [
      {
        indicator: 'RSI',
        params: { period: 14 },
        operator: 'lt',
        threshold: 35,
      },
    ],
    exitConditions: [
      {
        indicator: 'RSI',
        params: { period: 14 },
        operator: 'gt',
        threshold: 65,
      },
    ],
  };

  it('handles small history edge case gracefully', () => {
    const result = runBacktest(sampleSpec, sampleBars.slice(0, 5));
    expect(result.totalTrades).toBe(0);
    expect(result.initialCapital).toBe(100000);
    expect(result.endingCapital).toBe(100000);
  });

  it('executes backtest deterministically and produces equity curve and metrics', () => {
    const result1 = runBacktest(sampleSpec, sampleBars);
    const result2 = runBacktest(sampleSpec, sampleBars);

    // Exact deterministic reproduction
    expect(result1.endingCapital).toBe(result2.endingCapital);
    expect(result1.totalTrades).toBe(result2.totalTrades);
    expect(result1.equityCurve.length).toBe(sampleBars.length);
    expect(result1.regulatoryNotice).toContain('Past performance');
  });
});
