import { describe, it, expect } from 'vitest';
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateATR,
} from './indicators';
import type { OHLCV } from '@stockan/shared';

describe('Technical Indicators', () => {
  it('calculates SMA correctly and handles empty/boundary cases', () => {
    expect(calculateSMA([], 5)).toEqual([]);
    expect(calculateSMA([10, 20, 30], 0)).toEqual([null, null, null]);

    const values = [1, 2, 3, 4, 5, 6];
    const sma3 = calculateSMA(values, 3);
    expect(sma3[0]).toBeNull();
    expect(sma3[1]).toBeNull();
    expect(sma3[2]).toBe(2); // (1+2+3)/3
    expect(sma3[3]).toBe(3); // (2+3+4)/3
    expect(sma3[4]).toBe(4); // (3+4+5)/3
    expect(sma3[5]).toBe(5); // (4+5+6)/3
  });

  it('calculates EMA correctly', () => {
    const values = [10, 11, 12, 13, 14, 15];
    const ema3 = calculateEMA(values, 3);
    expect(ema3[0]).toBeNull();
    expect(ema3[1]).toBeNull();
    expect(ema3[2]).toBe(11); // initial SMA is (10+11+12)/3 = 11
    // multiplier = 2/(3+1) = 0.5
    // ema[3] = (13 - 11)*0.5 + 11 = 12
    expect(ema3[3]).toBe(12);
  });

  it('calculates RSI correctly and handles flat series without division by zero', () => {
    const flat = [10, 10, 10, 10, 10];
    const flatRSI = calculateRSI(flat, 2);
    expect(flatRSI[2]).toBe(100);

    const upward = [10, 12, 14, 16, 18, 20, 22];
    const upRSI = calculateRSI(upward, 3);
    expect(upRSI[3]).toBe(100);
  });

  it('calculates MACD and signal line', () => {
    const closes = Array.from({ length: 40 }, (_, i) => 100 + i * 2);
    const macd = calculateMACD(closes, 12, 26, 9);
    expect(macd.macdLine.length).toBe(40);
    expect(macd.signalLine.length).toBe(40);
    expect(macd.histogram.length).toBe(40);
  });

  it('calculates Bollinger Bands with correct standard deviations', () => {
    const closes = Array.from({ length: 25 }, () => 100);
    const bb = calculateBollingerBands(closes, 20, 2);
    expect(bb.middle[20]).toBe(100);
    expect(bb.upper[20]).toBe(100);
    expect(bb.lower[20]).toBe(100);
  });

  it('calculates ATR correctly', () => {
    const bars: OHLCV[] = [
      { timestamp: '2025-01-01', open: 10, high: 12, low: 9, close: 11, volume: 100 },
      { timestamp: '2025-01-02', open: 11, high: 15, low: 10, close: 14, volume: 100 },
      { timestamp: '2025-01-03', open: 14, high: 16, low: 13, close: 15, volume: 100 },
      { timestamp: '2025-01-04', open: 15, high: 18, low: 14, close: 17, volume: 100 },
    ];
    const atr = calculateATR(bars, 2);
    expect(atr[0]).toBeNull();
    expect(atr[1]).toBeGreaterThan(0);
  });
});
