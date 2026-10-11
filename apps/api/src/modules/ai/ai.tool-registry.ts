import type {
  Quote,
  Fundamentals,
  Filing,
  ScreenerQuery,
  ScreenerResult,
  Position,
  PortfolioRiskMetrics,
  StrategySpec,
  BacktestExecutionReport,
  ToolCallLog,
} from '@stockan/shared';
import type { IMarketDataProvider } from '../../providers/market-data.interface';
import { calculateFullPortfolioRisk, runBacktest } from '@stockan/analytics';
export class AIToolRegistry {
  constructor(private readonly marketDataProvider: IMarketDataProvider) {}

  async getQuote(
    symbol: string,
    toolLogs: ToolCallLog[]
  ): Promise<Quote> {
    const start = Date.now();
    const result = await this.marketDataProvider.getQuote(symbol);
    const duration = Date.now() - start;

    toolLogs.push({
      toolName: 'get_quote',
      input: { symbol },
      outputSummary: `Price: $${result.price}, Change: ${result.changePercent}%, Volume: ${result.volume}`,
      executionTimeMs: duration,
    });
    return result;
  }

  async getFundamentals(
    symbol: string,
    toolLogs: ToolCallLog[]
  ): Promise<Fundamentals> {
    const start = Date.now();
    const result = await this.marketDataProvider.getFundamentals(symbol);
    const duration = Date.now() - start;

    toolLogs.push({
      toolName: 'get_fundamentals',
      input: { symbol },
      outputSummary: `P/E: ${result.metrics.peRatioTTM}, Rev: $${result.statements[0]?.revenue}, Statements: ${result.statements.length}`,
      executionTimeMs: duration,
    });
    return result;
  }

  async getFilings(
    symbol: string,
    toolLogs: ToolCallLog[]
  ): Promise<Filing[]> {
    const start = Date.now();
    const result = await this.marketDataProvider.getFilings(symbol);
    const duration = Date.now() - start;

    toolLogs.push({
      toolName: 'get_filings',
      input: { symbol },
      outputSummary: `Fetched ${result.length} SEC filings for ${symbol}`,
      executionTimeMs: duration,
    });
    return result;
  }

  async executeScreener(
    query: ScreenerQuery,
    toolLogs: ToolCallLog[]
  ): Promise<ScreenerResult> {
    const start = Date.now();
    const result = await this.marketDataProvider.screen(query);
    const duration = Date.now() - start;

    toolLogs.push({
      toolName: 'execute_screener',
      input: query as any,
      outputSummary: `Matched ${result.totalCount} stocks (${result.items.length} returned)`,
      executionTimeMs: duration,
    });
    return result;
  }

  async calculateRiskMetrics(
    positions: Position[],
    historicalPortfolioReturns: number[],
    benchmarkReturns: number[],
    returnsBySymbol: Record<string, number[]>,
    toolLogs: ToolCallLog[]
  ): Promise<PortfolioRiskMetrics> {
    const start = Date.now();
    const result = calculateFullPortfolioRisk(
      positions,
      historicalPortfolioReturns,
      benchmarkReturns,
      returnsBySymbol
    );
    const duration = Date.now() - start;

    toolLogs.push({
      toolName: 'calculate_risk_metrics',
      input: { positionsCount: positions.length },
      outputSummary: `Total Value: $${result.totalValue}, Beta: ${result.beta}, Sharpe: ${result.sharpeRatio}, Max DD: ${(result.maxDrawdown * 100).toFixed(1)}%`,
      executionTimeMs: duration,
    });
    return result;
  }

  async runBacktest(
    spec: StrategySpec,
    toolLogs: ToolCallLog[]
  ): Promise<BacktestExecutionReport> {
    const start = Date.now();
    const bars = await this.marketDataProvider.getHistory(spec.symbol, '1d', '1y');
    const result = runBacktest(spec, bars);
    const duration = Date.now() - start;

    toolLogs.push({
      toolName: 'run_backtest',
      input: { strategy: spec.name, symbol: spec.symbol, conditions: spec.entryConditions.length },
      outputSummary: `Total Return: ${result.totalReturnPercent}%, Sharpe: ${result.sharpeRatio}, Trades: ${result.totalTrades}`,
      executionTimeMs: duration,
    });
    return result;
  }
}
