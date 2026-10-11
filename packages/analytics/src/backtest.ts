import type {
  OHLCV,
  StrategySpec,
  TradeRecord,
  BacktestExecutionReport,
  BacktestRuleCondition,
} from '@stockwise/shared';
import { calculateSMA, calculateEMA, calculateRSI } from './indicators';
import { calculateMaxDrawdown, calculateSharpeRatio, calculateReturns } from './risk';

interface PrecomputedSeries {
  sma: Map<number, (number | null)[]>;
  ema: Map<number, (number | null)[]>;
  rsi: Map<number, (number | null)[]>;
  prices: number[];
  volumes: number[];
}

function evaluateCondition(
  cond: BacktestRuleCondition,
  index: number,
  precomputed: PrecomputedSeries
): boolean {
  if (index < 1) return false;

  let currentVal: number | null = null;
  let prevVal: number | null = null;

  if (cond.indicator === 'PRICE') {
    currentVal = precomputed.prices[index] ?? null;
    prevVal = precomputed.prices[index - 1] ?? null;
  } else if (cond.indicator === 'VOLUME') {
    currentVal = precomputed.volumes[index] ?? null;
    prevVal = precomputed.volumes[index - 1] ?? null;
  } else if (cond.indicator === 'SMA') {
    const period = cond.params['period'] ?? 20;
    const series = precomputed.sma.get(period);
    currentVal = series?.[index] ?? null;
    prevVal = series?.[index - 1] ?? null;
  } else if (cond.indicator === 'EMA') {
    const period = cond.params['period'] ?? 20;
    const series = precomputed.ema.get(period);
    currentVal = series?.[index] ?? null;
    prevVal = series?.[index - 1] ?? null;
  } else if (cond.indicator === 'RSI') {
    const period = cond.params['period'] ?? 14;
    const series = precomputed.rsi.get(period);
    currentVal = series?.[index] ?? null;
    prevVal = series?.[index - 1] ?? null;
  }

  if (currentVal === null) return false;

  switch (cond.operator) {
    case 'gt':
      return currentVal > cond.threshold;
    case 'lt':
      return currentVal < cond.threshold;
    case 'crosses_above':
      return prevVal !== null && prevVal <= cond.threshold && currentVal > cond.threshold;
    case 'crosses_below':
      return prevVal !== null && prevVal >= cond.threshold && currentVal < cond.threshold;
    default:
      return false;
  }
}

/**
 * Runs a deterministic backtest of a strategy spec on a set of historical OHLCV bars.
 */
export function runBacktest(spec: StrategySpec, bars: OHLCV[]): BacktestExecutionReport {
  if (bars.length < 10) {
    return {
      strategyName: spec.name,
      symbol: spec.symbol,
      startDate: bars[0]?.timestamp ?? '',
      endDate: bars[bars.length - 1]?.timestamp ?? '',
      initialCapital: spec.initialCapital,
      endingCapital: spec.initialCapital,
      totalReturnPercent: 0,
      annualizedReturnPercent: 0,
      maxDrawdownPercent: 0,
      sharpeRatio: 0,
      winRatePercent: 0,
      profitFactor: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      trades: [],
      equityCurve: [],
      regulatoryNotice:
        'Past performance is deterministic backtest simulation only. Not investment advice.',
    };
  }

  const closes = bars.map((b) => b.close);
  const volumes = bars.map((b) => b.volume);

  // Precompute required indicators
  const precomputed: PrecomputedSeries = {
    sma: new Map(),
    ema: new Map(),
    rsi: new Map(),
    prices: closes,
    volumes: volumes,
  };

  const allConditions = [...spec.entryConditions, ...spec.exitConditions];
  for (const c of allConditions) {
    const period = c.params['period'] ?? (c.indicator === 'RSI' ? 14 : 20);
    if (c.indicator === 'SMA' && !precomputed.sma.has(period)) {
      precomputed.sma.set(period, calculateSMA(closes, period));
    } else if (c.indicator === 'EMA' && !precomputed.ema.has(period)) {
      precomputed.ema.set(period, calculateEMA(closes, period));
    } else if (c.indicator === 'RSI' && !precomputed.rsi.has(period)) {
      precomputed.rsi.set(period, calculateRSI(closes, period));
    }
  }

  let capital = spec.initialCapital;
  let inPosition = false;
  let entryPrice = 0;
  let entryDate = '';
  let entryIndex = 0;
  let shares = 0;

  const slippageMultiplier = 1 + spec.slippageBasisPoints / 10000;
  const exitSlippageMultiplier = 1 - spec.slippageBasisPoints / 10000;

  const trades: TradeRecord[] = [];
  const equityPoints: { date: string; equity: number; drawdownPercent: number }[] = [];
  let peakEquity = capital;

  for (let i = 0; i < bars.length; i++) {
    const bar = bars[i]!;
    const currentPrice = bar.close;

    if (inPosition) {
      // Check Stop Loss
      const currentLossPct = (entryPrice - currentPrice) / entryPrice;
      const hitStopLoss =
        spec.stopLossPercent !== undefined && currentLossPct >= spec.stopLossPercent / 100;

      // Check Take Profit
      const currentGainPct = (currentPrice - entryPrice) / entryPrice;
      const hitTakeProfit =
        spec.takeProfitPercent !== undefined && currentGainPct >= spec.takeProfitPercent / 100;

      // Check Exit Conditions
      const exitSignal =
        spec.exitConditions.length > 0 &&
        spec.exitConditions.every((cond) => evaluateCondition(cond, i, precomputed));

      if (hitStopLoss || hitTakeProfit || exitSignal || i === bars.length - 1) {
        const exitExecPrice = currentPrice * exitSlippageMultiplier;
        const proceeds = shares * exitExecPrice;
        const pnl = proceeds - shares * entryPrice;
        const pnlPct = (pnl / (shares * entryPrice)) * 100;

        capital += proceeds;
        trades.push({
          id: `trade-${trades.length + 1}`,
          entryDate,
          entryPrice: Number(entryPrice.toFixed(2)),
          exitDate: bar.timestamp,
          exitPrice: Number(exitExecPrice.toFixed(2)),
          shares,
          pnl: Number(pnl.toFixed(2)),
          pnlPercent: Number(pnlPct.toFixed(2)),
          holdingPeriodDays: i - entryIndex,
          exitReason: hitStopLoss
            ? 'stop_loss'
            : hitTakeProfit
              ? 'take_profit'
              : i === bars.length - 1
                ? 'end_of_period'
                : 'signal',
        });

        inPosition = false;
        shares = 0;
      }
    } else if (i < bars.length - 1) {
      // Check Entry Conditions
      const entrySignal =
        spec.entryConditions.length > 0 &&
        spec.entryConditions.every((cond) => evaluateCondition(cond, i, precomputed));

      if (entrySignal) {
        const execPrice = currentPrice * slippageMultiplier;
        shares = Math.floor(capital / execPrice);
        if (shares > 0) {
          const cost = shares * execPrice;
          capital -= cost;
          entryPrice = execPrice;
          entryDate = bar.timestamp;
          entryIndex = i;
          inPosition = true;
        }
      }
    }

    const currentPortfolioValue = inPosition ? capital + shares * currentPrice : capital;
    if (currentPortfolioValue > peakEquity) {
      peakEquity = currentPortfolioValue;
    }
    const currentDrawdown =
      peakEquity > 0 ? ((peakEquity - currentPortfolioValue) / peakEquity) * 100 : 0;

    equityPoints.push({
      date: bar.timestamp,
      equity: Number(currentPortfolioValue.toFixed(2)),
      drawdownPercent: Number(currentDrawdown.toFixed(2)),
    });
  }

  const endingCapital = equityPoints[equityPoints.length - 1]?.equity ?? capital;
  const totalReturnPercent = ((endingCapital - spec.initialCapital) / spec.initialCapital) * 100;

  const totalDays = bars.length;
  const annualizedReturnPercent =
    totalDays > 0 ? (Math.pow(endingCapital / spec.initialCapital, 252 / totalDays) - 1) * 100 : 0;

  const equityValues = equityPoints.map((e) => e.equity);
  const { maxDrawdown } = calculateMaxDrawdown(equityValues);
  const dailyEquityReturns = calculateReturns(equityValues);
  const sharpe = calculateSharpeRatio(dailyEquityReturns);

  const winningTrades = trades.filter((t) => t.pnl > 0);
  const losingTrades = trades.filter((t) => t.pnl <= 0);
  const winRatePercent = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;

  const totalGains = winningTrades.reduce((acc, t) => acc + t.pnl, 0);
  const totalLosses = Math.abs(losingTrades.reduce((acc, t) => acc + t.pnl, 0));
  const profitFactor = totalLosses > 0 ? totalGains / totalLosses : totalGains > 0 ? 999 : 0;

  return {
    strategyName: spec.name,
    symbol: spec.symbol,
    startDate: bars[0]?.timestamp ?? '',
    endDate: bars[bars.length - 1]?.timestamp ?? '',
    initialCapital: Number(spec.initialCapital.toFixed(2)),
    endingCapital: Number(endingCapital.toFixed(2)),
    totalReturnPercent: Number(totalReturnPercent.toFixed(2)),
    annualizedReturnPercent: Number(annualizedReturnPercent.toFixed(2)),
    maxDrawdownPercent: Number((maxDrawdown * 100).toFixed(2)),
    sharpeRatio: Number(sharpe.toFixed(2)),
    winRatePercent: Number(winRatePercent.toFixed(2)),
    profitFactor: Number(profitFactor.toFixed(2)),
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    trades,
    equityCurve: equityPoints,
    regulatoryNotice:
      'Past performance is deterministic backtest simulation only. Not investment advice.',
  };
}
