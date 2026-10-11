import type { OHLCV } from '@stockwise/shared';

/**
 * Calculates Simple Moving Average (SMA).
 * Handles edge cases like empty array or period greater than array length.
 */
export function calculateSMA(values: number[], period: number): (number | null)[] {
  if (period <= 0 || values.length === 0) return values.map(() => null);
  const result: (number | null)[] = [];
  let sum = 0;

  for (let i = 0; i < values.length; i++) {
    const val = values[i] ?? 0;
    sum += val;
    if (i >= period) {
      sum -= values[i - period] ?? 0;
    }
    if (i >= period - 1) {
      result.push(sum / period);
    } else {
      result.push(null);
    }
  }

  return result;
}

/**
 * Calculates Exponential Moving Average (EMA).
 */
export function calculateEMA(values: number[], period: number): (number | null)[] {
  if (period <= 0 || values.length === 0) return values.map(() => null);
  const result: (number | null)[] = [];
  const multiplier = 2 / (period + 1);

  let initialSMA = 0;
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      initialSMA += values[i] ?? 0;
      result.push(null);
    } else if (i === period - 1) {
      initialSMA += values[i] ?? 0;
      const sma = initialSMA / period;
      result.push(sma);
    } else {
      const prevEMA = result[i - 1];
      if (prevEMA === null || prevEMA === undefined) {
        result.push(null);
      } else {
        const val = values[i] ?? 0;
        const currentEMA = (val - prevEMA) * multiplier + prevEMA;
        result.push(currentEMA);
      }
    }
  }

  return result;
}

/**
 * Calculates Relative Strength Index (RSI) using Wilder's smoothed method.
 */
export function calculateRSI(closes: number[], period: number = 14): (number | null)[] {
  if (period <= 0 || closes.length <= period) return closes.map(() => null);
  const result: (number | null)[] = new Array(closes.length).fill(null);

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = (closes[i] ?? 0) - (closes[i - 1] ?? 0);
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  if (avgLoss === 0) {
    result[period] = 100;
  } else {
    const rs = avgGain / avgLoss;
    result[period] = 100 - 100 / (1 + rs);
  }

  for (let i = period + 1; i < closes.length; i++) {
    const diff = (closes[i] ?? 0) - (closes[i - 1] ?? 0);
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      result[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      result[i] = 100 - 100 / (1 + rs);
    }
  }

  return result;
}

export interface MACDResult {
  macdLine: (number | null)[];
  signalLine: (number | null)[];
  histogram: (number | null)[];
}

/**
 * Calculates Moving Average Convergence Divergence (MACD).
 * Default: 12 fast, 26 slow, 9 signal.
 */
export function calculateMACD(
  closes: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult {
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);

  const macdLine: (number | null)[] = [];
  for (let i = 0; i < closes.length; i++) {
    const f = fastEMA[i];
    const s = slowEMA[i];
    if (f !== null && f !== undefined && s !== null && s !== undefined) {
      macdLine.push(f - s);
    } else {
      macdLine.push(null);
    }
  }

  // To compute signal line of macdLine, take valid entries
  const validMacdStartIndex = macdLine.findIndex((x) => x !== null);
  const signalLine: (number | null)[] = new Array(closes.length).fill(null);
  const histogram: (number | null)[] = new Array(closes.length).fill(null);

  if (validMacdStartIndex !== -1) {
    const validMacdValues = macdLine.slice(validMacdStartIndex) as number[];
    const signalEma = calculateEMA(validMacdValues, signalPeriod);

    for (let i = 0; i < signalEma.length; i++) {
      const originalIdx = validMacdStartIndex + i;
      const sigVal = signalEma[i];
      signalLine[originalIdx] = sigVal ?? null;
      const macdVal = macdLine[originalIdx];
      if (macdVal !== null && macdVal !== undefined && sigVal !== null && sigVal !== undefined) {
        histogram[originalIdx] = macdVal - sigVal;
      }
    }
  }

  return { macdLine, signalLine, histogram };
}

export interface BollingerBandsResult {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
  bandwidth: (number | null)[];
}

/**
 * Calculates Bollinger Bands (typical: 20 period, 2 standard deviations).
 */
export function calculateBollingerBands(
  closes: number[],
  period: number = 20,
  stdDevMultiplier: number = 2
): BollingerBandsResult {
  const middle = calculateSMA(closes, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  const bandwidth: (number | null)[] = [];

  for (let i = 0; i < closes.length; i++) {
    const mid = middle[i];
    if (mid === null || mid === undefined || i < period - 1) {
      upper.push(null);
      lower.push(null);
      bandwidth.push(null);
      continue;
    }

    const slice = closes.slice(i - period + 1, i + 1);
    const variance =
      slice.reduce((acc, val) => acc + Math.pow(val - mid, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    const up = mid + stdDevMultiplier * stdDev;
    const low = mid - stdDevMultiplier * stdDev;
    upper.push(up);
    lower.push(low);
    bandwidth.push(mid !== 0 ? (up - low) / mid : 0);
  }

  return { upper, middle, lower, bandwidth };
}

/**
 * Calculates Average True Range (ATR).
 */
export function calculateATR(bars: OHLCV[], period: number = 14): (number | null)[] {
  if (bars.length === 0 || period <= 0) return [];
  const tr: number[] = [];

  for (let i = 0; i < bars.length; i++) {
    const cur = bars[i]!;
    if (i === 0) {
      tr.push(cur.high - cur.low);
    } else {
      const prev = bars[i - 1]!;
      const highLow = cur.high - cur.low;
      const highClose = Math.abs(cur.high - prev.close);
      const lowClose = Math.abs(cur.low - prev.close);
      tr.push(Math.max(highLow, highClose, lowClose));
    }
  }

  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < period) return result;

  let initialTRSum = 0;
  for (let i = 0; i < period; i++) {
    initialTRSum += tr[i] ?? 0;
  }
  let currentATR = initialTRSum / period;
  result[period - 1] = currentATR;

  for (let i = period; i < bars.length; i++) {
    const currentTR = tr[i] ?? 0;
    currentATR = (currentATR * (period - 1) + currentTR) / period;
    result[i] = currentATR;
  }

  return result;
}
