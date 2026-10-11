import { describe, it, expect } from 'vitest';
import {
  calculateReturns,
  mean,
  standardDeviation,
  calculateAnnualizedVolatility,
  calculateSharpeRatio,
  calculateSortinoRatio,
  calculateMaxDrawdown,
  calculateHistoricalVaR,
  calculateHistoricalCVaR,
  calculateBeta,
  calculateCorrelation,
  calculateCorrelationMatrix,
  aggregateSectorExposures,
  computeDrawdownScenarios,
  runMonteCarloSimulation,
} from './risk';
import type { Position } from '@stockan/shared';

describe('Risk Analytics', () => {
  it('calculates returns and stats correctly', () => {
    const prices = [100, 105, 110.25];
    const ret = calculateReturns(prices);
    expect(ret.length).toBe(2);
    expect(ret[0]).toBeCloseTo(0.05, 4);
    expect(ret[1]).toBeCloseTo(0.05, 4);

    expect(mean([1, 2, 3, 4, 5])).toBe(3);
    expect(standardDeviation([10, 10, 10])).toBe(0);
  });

  it('calculates Sharpe and Sortino ratios', () => {
    const dailyReturns = [0.01, 0.005, -0.002, 0.008, 0.012, -0.001, 0.004];
    const sharpe = calculateSharpeRatio(dailyReturns, 0.04);
    expect(typeof sharpe).toBe('number');

    const vol = calculateAnnualizedVolatility(dailyReturns);
    expect(vol).toBeGreaterThan(0);

    const sortino = calculateSortinoRatio(dailyReturns, 0.04);
    expect(typeof sortino).toBe('number');
  });

  it('calculates Maximum Drawdown properly', () => {
    const prices = [100, 120, 90, 110, 80, 130];
    // Peak is 120, trough is 80 -> (120 - 80) / 120 = 40/120 = 0.3333...
    const dd = calculateMaxDrawdown(prices);
    expect(dd.maxDrawdown).toBeCloseTo(0.3333, 3);
    expect(dd.peakIndex).toBe(1);
    expect(dd.troughIndex).toBe(4);
  });

  it('calculates Historical VaR and CVaR', () => {
    const returns = [-0.05, -0.03, -0.02, 0.01, 0.02, 0.03, 0.04, 0.05];
    const var95 = calculateHistoricalVaR(returns, 0.95);
    expect(var95).toBeGreaterThan(0);
    const cvar95 = calculateHistoricalCVaR(returns, 0.95);
    expect(cvar95).toBeGreaterThanOrEqual(var95);
  });

  it('calculates Beta and Correlation matrix', () => {
    const assetReturns = [0.02, 0.04, -0.01, 0.03];
    const benchReturns = [0.01, 0.02, -0.005, 0.015];
    const beta = calculateBeta(assetReturns, benchReturns);
    expect(beta).toBeCloseTo(2.0, 1);

    const corr = calculateCorrelation(assetReturns, benchReturns);
    expect(corr).toBeCloseTo(1.0, 2);

    const matrix = calculateCorrelationMatrix({
      AAPL: assetReturns,
      SPY: benchReturns,
    });
    expect(matrix['AAPL']?.['AAPL']).toBe(1.0);
    expect(matrix['AAPL']?.['SPY']).toBeCloseTo(1.0, 2);
  });

  it('aggregates sector exposures and computes drawdown scenarios', () => {
    const positions: Position[] = [
      {
        id: '1',
        symbol: 'AAPL',
        companyName: 'Apple Inc.',
        sector: 'Technology',
        shares: 10,
        averageCost: 150,
        currentPrice: 200,
        marketValue: 2000,
        unrealizedGain: 500,
        unrealizedGainPercent: 33.33,
        weightPercent: 66.67,
      },
      {
        id: '2',
        symbol: 'JNJ',
        companyName: 'Johnson & Johnson',
        sector: 'Healthcare',
        shares: 5,
        averageCost: 150,
        currentPrice: 200,
        marketValue: 1000,
        unrealizedGain: 250,
        unrealizedGainPercent: 33.33,
        weightPercent: 33.33,
      },
    ];

    const exposures = aggregateSectorExposures(positions, 3000);
    expect(exposures.length).toBe(2);
    expect(exposures[0]?.sector).toBe('Technology');
    expect(exposures[0]?.weightPercent).toBeCloseTo(66.67, 1);

    const scenarios = computeDrawdownScenarios(positions, 1.1);
    expect(scenarios.length).toBeGreaterThan(0);
    expect(scenarios[0]?.estimatedPortfolioLossValue).toBeGreaterThan(0);
  });

  it('runs deterministic Monte Carlo simulation with consistent seed', () => {
    const mc = runMonteCarloSimulation(100000, 0.0005, 0.012, 50, 100, 12345);
    expect(mc.simulationDays).toBe(50);
    expect(mc.trajectories.median.length).toBe(51);
    expect(mc.percentile5Value).toBeLessThanOrEqual(mc.medianValue);
    expect(mc.medianValue).toBeLessThanOrEqual(mc.percentile95Value);
  });
});
