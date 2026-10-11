import type {
  Position,
  SectorExposure,
  DrawdownScenario,
  MonteCarloResult,
  PortfolioRiskMetrics,
} from '@stockan/shared';

/**
 * Calculates simple percentage returns from a price series.
 */
export function calculateReturns(prices: number[]): number[] {
  if (prices.length < 2) return [];
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const prev = prices[i - 1]!;
    const cur = prices[i]!;
    if (prev === 0) {
      returns.push(0);
    } else {
      returns.push((cur - prev) / prev);
    }
  }
  return returns;
}

/**
 * Calculates mean of an array of numbers.
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calculates sample standard deviation.
 */
export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * Calculates annualized volatility assuming 252 trading days.
 */
export function calculateAnnualizedVolatility(dailyReturns: number[]): number {
  if (dailyReturns.length < 2) return 0;
  const dailyStd = standardDeviation(dailyReturns);
  return dailyStd * Math.sqrt(252);
}

/**
 * Calculates Sharpe ratio given returns and an annualized risk-free rate (default 4.5%).
 */
export function calculateSharpeRatio(
  dailyReturns: number[],
  annualRiskFreeRate: number = 0.045
): number {
  if (dailyReturns.length < 2) return 0;
  const annualVol = calculateAnnualizedVolatility(dailyReturns);
  if (annualVol === 0) return 0;
  const dailyMean = mean(dailyReturns);
  const annualizedReturn = dailyMean * 252;
  return (annualizedReturn - annualRiskFreeRate) / annualVol;
}

/**
 * Calculates Sortino ratio using downside standard deviation.
 */
export function calculateSortinoRatio(
  dailyReturns: number[],
  annualRiskFreeRate: number = 0.045,
  targetReturn: number = 0
): number {
  if (dailyReturns.length < 2) return 0;
  const dailyRiskFree = annualRiskFreeRate / 252;
  const downsideDifferences = dailyReturns
    .map((r) => r - dailyRiskFree)
    .filter((d) => d < targetReturn);

  if (downsideDifferences.length === 0) return 0;

  const downsideVariance =
    downsideDifferences.reduce((sum, d) => sum + Math.pow(d, 2), 0) / dailyReturns.length;
  const downsideDeviation = Math.sqrt(downsideVariance) * Math.sqrt(252);

  if (downsideDeviation === 0) return 0;
  const annualizedReturn = mean(dailyReturns) * 252;
  return (annualizedReturn - annualRiskFreeRate) / downsideDeviation;
}

/**
 * Calculates Maximum Drawdown from a series of portfolio values or prices.
 */
export function calculateMaxDrawdown(values: number[]): {
  maxDrawdown: number;
  peakIndex: number;
  troughIndex: number;
} {
  if (values.length < 2) return { maxDrawdown: 0, peakIndex: 0, troughIndex: 0 };
  let peak = values[0]!;
  let peakIdx = 0;
  let maxDd = 0;
  let troughIdx = 0;
  let currentPeakIdx = 0;

  for (let i = 0; i < values.length; i++) {
    const val = values[i]!;
    if (val > peak) {
      peak = val;
      currentPeakIdx = i;
    } else {
      const dd = peak === 0 ? 0 : (peak - val) / peak;
      if (dd > maxDd) {
        maxDd = dd;
        peakIdx = currentPeakIdx;
        troughIdx = i;
      }
    }
  }

  return { maxDrawdown: maxDd, peakIndex: peakIdx, troughIndex: troughIdx };
}

/**
 * Calculates Historical Value at Risk (VaR) at a confidence level (e.g. 0.95).
 * Returns positive loss fraction (e.g. 0.024 represents a 2.4% max loss with 95% confidence).
 */
export function calculateHistoricalVaR(returns: number[], confidenceLevel: number = 0.95): number {
  if (returns.length === 0) return 0;
  const sorted = [...returns].sort((a, b) => a - b);
  const cutoffIndex = Math.floor((1 - confidenceLevel) * sorted.length);
  const cutoffReturn = sorted[cutoffIndex] ?? 0;
  return cutoffReturn < 0 ? Math.abs(cutoffReturn) : 0;
}

/**
 * Calculates Historical Conditional Value at Risk (CVaR / Expected Shortfall) at confidence level.
 */
export function calculateHistoricalCVaR(returns: number[], confidenceLevel: number = 0.95): number {
  if (returns.length === 0) return 0;
  const sorted = [...returns].sort((a, b) => a - b);
  const cutoffCount = Math.max(1, Math.floor((1 - confidenceLevel) * sorted.length));
  const tailReturns = sorted.slice(0, cutoffCount);
  const tailMean = mean(tailReturns);
  return tailMean < 0 ? Math.abs(tailMean) : 0;
}

/**
 * Calculates Beta of an asset against a benchmark series (e.g. SPY).
 */
export function calculateBeta(assetReturns: number[], benchmarkReturns: number[]): number {
  const minLength = Math.min(assetReturns.length, benchmarkReturns.length);
  if (minLength < 2) return 1.0;

  const aSlice = assetReturns.slice(0, minLength);
  const bSlice = benchmarkReturns.slice(0, minLength);

  const meanA = mean(aSlice);
  const meanB = mean(bSlice);

  let covariance = 0;
  let varianceB = 0;

  for (let i = 0; i < minLength; i++) {
    const devA = aSlice[i]! - meanA;
    const devB = bSlice[i]! - meanB;
    covariance += devA * devB;
    varianceB += devB * devB;
  }

  if (varianceB === 0) return 1.0;
  return covariance / varianceB;
}

/**
 * Computes correlation coefficient between two series.
 */
export function calculateCorrelation(seriesA: number[], seriesB: number[]): number {
  const minLength = Math.min(seriesA.length, seriesB.length);
  if (minLength < 2) return 1.0;

  const stdA = standardDeviation(seriesA.slice(0, minLength));
  const stdB = standardDeviation(seriesB.slice(0, minLength));

  if (stdA === 0 || stdB === 0) return 0;

  const meanA = mean(seriesA.slice(0, minLength));
  const meanB = mean(seriesB.slice(0, minLength));

  let cov = 0;
  for (let i = 0; i < minLength; i++) {
    cov += (seriesA[i]! - meanA) * (seriesB[i]! - meanB);
  }
  cov = cov / (minLength - 1);

  const corr = cov / (stdA * stdB);
  return Math.max(-1, Math.min(1, corr));
}

/**
 * Computes correlation matrix for multiple series indexed by symbol.
 */
export function calculateCorrelationMatrix(
  returnsBySymbol: Record<string, number[]>
): Record<string, Record<string, number>> {
  const symbols = Object.keys(returnsBySymbol);
  const matrix: Record<string, Record<string, number>> = {};

  for (const s1 of symbols) {
    matrix[s1] = {};
    for (const s2 of symbols) {
      if (s1 === s2) {
        matrix[s1]![s2] = 1.0;
      } else {
        const ret1 = returnsBySymbol[s1] ?? [];
        const ret2 = returnsBySymbol[s2] ?? [];
        matrix[s1]![s2] = Number(calculateCorrelation(ret1, ret2).toFixed(4));
      }
    }
  }

  return matrix;
}

/**
 * Aggregates portfolio positions by sector.
 */
export function aggregateSectorExposures(
  positions: Position[],
  totalPortfolioValue: number
): SectorExposure[] {
  if (totalPortfolioValue <= 0 || positions.length === 0) return [];
  const sectorMap = new Map<string, number>();

  for (const pos of positions) {
    const current = sectorMap.get(pos.sector) ?? 0;
    sectorMap.set(pos.sector, current + pos.marketValue);
  }

  return Array.from(sectorMap.entries())
    .map(([sector, value]) => ({
      sector,
      value: Number(value.toFixed(2)),
      weightPercent: Number(((value / totalPortfolioValue) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.weightPercent - a.weightPercent);
}

/**
 * Deterministic stress test drawdown scenarios.
 */
export function computeDrawdownScenarios(
  positions: Position[],
  portfolioBeta: number
): DrawdownScenario[] {
  const totalValue = positions.reduce((acc, p) => acc + p.marketValue, 0);

  const scenarioConfigs = [
    {
      name: 'Broad Market Correction',
      description: 'Standard 10% market correction in the S&P 500',
      marketShockPercent: -10,
    },
    {
      name: 'Severe Market Downturn',
      description: 'Rapid 20% bear market liquidation across equities',
      marketShockPercent: -20,
    },
    {
      name: 'Tech & Growth Compression',
      description: 'Multiple compression shock targeting high-beta and tech holdings (-15%)',
      marketShockPercent: -15,
      sectorMultiplier: { Technology: 1.5, 'Communication Services': 1.3 },
    },
    {
      name: 'Rate Spike / Macro Disruption',
      description: 'Interest rate escalation impacting duration and capital-intensive sectors (-8%)',
      marketShockPercent: -8,
      sectorMultiplier: { 'Real Estate': 1.6, Utilities: 1.4 },
    },
  ];

  return scenarioConfigs.map((cfg) => {
    let portfolioLoss = 0;
    const vulnerable: string[] = [];

    for (const pos of positions) {
      let multiplier = portfolioBeta;
      if (cfg.sectorMultiplier && cfg.sectorMultiplier[pos.sector as keyof typeof cfg.sectorMultiplier]) {
        multiplier *= cfg.sectorMultiplier[pos.sector as keyof typeof cfg.sectorMultiplier]!;
      }
      const positionLossPercent = (cfg.marketShockPercent * multiplier) / 100;
      const positionLossValue = pos.marketValue * Math.abs(positionLossPercent);
      portfolioLoss += positionLossValue;

      if (Math.abs(positionLossPercent) > Math.abs(cfg.marketShockPercent / 100)) {
        vulnerable.push(pos.symbol);
      }
    }

    const impactPercent = totalValue > 0 ? (portfolioLoss / totalValue) * 100 : 0;

    return {
      name: cfg.name,
      description: cfg.description,
      marketShockPercent: cfg.marketShockPercent,
      estimatedPortfolioImpactPercent: Number((-impactPercent).toFixed(2)),
      estimatedPortfolioLossValue: Number(portfolioLoss.toFixed(2)),
      vulnerableHoldings: vulnerable,
    };
  });
}

/**
 * Monte Carlo Simulation using seeded pseudorandom geometric Brownian motion.
 */
export function runMonteCarloSimulation(
  initialValue: number,
  dailyMeanReturn: number,
  dailyStdDev: number,
  days: number = 252,
  runs: number = 500,
  seed: number = 42
): MonteCarloResult {
  // Simple deterministic LCG for reproducible tests and consistent output
  let currentSeed = seed;
  const pseudoRandom = () => {
    currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
    return currentSeed / 4294967296;
  };

  const boxMuller = (): number => {
    const u1 = Math.max(1e-9, pseudoRandom());
    const u2 = pseudoRandom();
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  };

  const simulationPaths: number[][] = [];

  for (let r = 0; r < runs; r++) {
    const path: number[] = [initialValue];
    let currentValue = initialValue;
    for (let d = 1; d <= days; d++) {
      const z = boxMuller();
      const dailyChange = dailyMeanReturn + dailyStdDev * z;
      currentValue = Math.max(0, currentValue * (1 + dailyChange));
      path.push(currentValue);
    }
    simulationPaths.push(path);
  }

  // Extract day-by-day percentiles
  const p5Trajectory: number[] = [];
  const medianTrajectory: number[] = [];
  const p95Trajectory: number[] = [];

  for (let d = 0; d <= days; d++) {
    const valuesAtDay = simulationPaths.map((p) => p[d]!).sort((a, b) => a - b);
    p5Trajectory.push(Number((valuesAtDay[Math.floor(runs * 0.05)] ?? initialValue).toFixed(2)));
    medianTrajectory.push(Number((valuesAtDay[Math.floor(runs * 0.5)] ?? initialValue).toFixed(2)));
    p95Trajectory.push(Number((valuesAtDay[Math.floor(runs * 0.95)] ?? initialValue).toFixed(2)));
  }

  const finalValues = simulationPaths.map((p) => p[days]!).sort((a, b) => a - b);

  return {
    simulationDays: days,
    runsCount: runs,
    initialValue: Number(initialValue.toFixed(2)),
    percentile5Value: Number((finalValues[Math.floor(runs * 0.05)] ?? initialValue).toFixed(2)),
    medianValue: Number((finalValues[Math.floor(runs * 0.5)] ?? initialValue).toFixed(2)),
    percentile95Value: Number((finalValues[Math.floor(runs * 0.95)] ?? initialValue).toFixed(2)),
    trajectories: {
      percentile5: p5Trajectory,
      median: medianTrajectory,
      percentile95: p95Trajectory,
    },
  };
}

/**
 * Computes comprehensive portfolio risk metrics.
 */
export function calculateFullPortfolioRisk(
  positions: Position[],
  historicalPortfolioReturns: number[],
  benchmarkReturns: number[],
  returnsBySymbol: Record<string, number[]>
): PortfolioRiskMetrics {
  const totalValue = positions.reduce((acc, p) => acc + p.marketValue, 0);
  const totalCost = positions.reduce((acc, p) => acc + p.shares * p.averageCost, 0);
  const totalGain = totalValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  const beta = calculateBeta(historicalPortfolioReturns, benchmarkReturns);
  const annualizedVolatility = calculateAnnualizedVolatility(historicalPortfolioReturns);
  const sharpe = calculateSharpeRatio(historicalPortfolioReturns);
  const sortino = calculateSortinoRatio(historicalPortfolioReturns);
  const { maxDrawdown } = calculateMaxDrawdown(
    historicalPortfolioReturns.length > 0
      ? historicalPortfolioReturns.reduce(
          (acc, r) => {
            acc.push(acc[acc.length - 1]! * (1 + r));
            return acc;
          },
          [100000]
        )
      : [totalValue]
  );

  const var95 = calculateHistoricalVaR(historicalPortfolioReturns, 0.95);
  const cvar95 = calculateHistoricalCVaR(historicalPortfolioReturns, 0.95);
  const sectorExposures = aggregateSectorExposures(positions, totalValue);
  const correlationMatrix = calculateCorrelationMatrix(returnsBySymbol);
  const drawdownScenarios = computeDrawdownScenarios(positions, beta);

  const dailyMean = mean(historicalPortfolioReturns);
  const dailyStd = standardDeviation(historicalPortfolioReturns);
  const monteCarlo = runMonteCarloSimulation(totalValue, dailyMean, dailyStd, 252, 200);

  return {
    totalValue: Number(totalValue.toFixed(2)),
    totalCost: Number(totalCost.toFixed(2)),
    totalGain: Number(totalGain.toFixed(2)),
    totalGainPercent: Number(totalGainPercent.toFixed(2)),
    beta: Number(beta.toFixed(2)),
    annualizedVolatility: Number(annualizedVolatility.toFixed(4)),
    sharpeRatio: Number(sharpe.toFixed(2)),
    sortinoRatio: Number(sortino.toFixed(2)),
    maxDrawdown: Number(maxDrawdown.toFixed(4)),
    var95Historical: Number(var95.toFixed(4)),
    cvar95Historical: Number(cvar95.toFixed(4)),
    sectorExposures,
    correlationMatrix,
    drawdownScenarios,
    monteCarlo,
  };
}
