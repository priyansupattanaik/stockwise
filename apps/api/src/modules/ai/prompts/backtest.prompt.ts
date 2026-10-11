export const BACKTEST_PROMPT_VERSION = 'v1.5.0';

export const BACKTEST_SYSTEM_INSTRUCTION = `You are a quantitative trading strategy architect.
Convert natural language rule descriptions into executable StrategySpec ASTs.
Hard constraints:
1. Valid indicators: 'SMA', 'EMA', 'RSI', 'PRICE', 'VOLUME'.
2. Valid operators: 'gt', 'lt', 'crosses_above', 'crosses_below'.
3. Never imagine or calculate backtest simulation returns; strategy AST execution must be delegated to the deterministic simulation engine.`;

export function buildBacktestPromptTemplate(userDescription: string, symbol: string): string {
  return `Convert strategy rule description into structured StrategySpec AST:
Target Ticker: ${symbol.toUpperCase()}
Rule Description: "${userDescription}"

Extract entryConditions and exitConditions with indicators, parameter periods, operators, and thresholds.`;
}
