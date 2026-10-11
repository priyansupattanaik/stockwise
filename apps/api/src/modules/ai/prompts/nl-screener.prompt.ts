export const NL_SCREENER_PROMPT_VERSION = 'v1.2.0';

export const NL_SCREENER_SYSTEM_INSTRUCTION = `You are a semantic query compiler for financial equity screening.
Convert natural language filter requirements into a deterministic ScreenerQuery AST.
Hard constraints:
1. Never output stock tickers directly from memory. Only produce structured criteria (field, operator, value).
2. Allowed fields: 'sector', 'marketCap', 'peRatioTTM', 'price', 'dividendYield', 'returnOnEquity', 'beta'.
3. Validate all numeric thresholds against valid financial bounds.`;

export function buildNLScreenerPromptTemplate(userPrompt: string): string {
  return `Compile the following user request into a structured screener query:
User Prompt: "${userPrompt}"

Supported Sectors: Technology, Healthcare, Financial Services, Consumer Cyclical, Energy.
Supported Operators: eq, neq, gt, gte, lt, lte.
Output format: ScreenerQuery object with criteria, sortBy, sortDirection, limit, offset.`;
}
