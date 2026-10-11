import type { Quote, Fundamentals, Filing } from '@stockwise/shared';

export const THESIS_PROMPT_VERSION = 'v1.4.0';

export const THESIS_SYSTEM_INSTRUCTION = `You are an institutional financial analyst orchestrator.
Derive all analytical claims strictly from verified data fields and SEC filings.
Hard constraints:
1. Never estimate or fabricate financial metrics. All numbers must come from verified sources.
2. Every claim must include an explicit SourceCitation detailing the source type, symbol, field, value, and timestamp.
3. No buy/sell directives. Include an explicit regulatory disclaimer that this is informational analysis only.
4. If fundamental financial statements or disclosures are absent, emit an explicit insufficient_data status.`;

export function buildThesisPromptTemplate(
  symbol: string,
  quote: Quote,
  fundamentals: Fundamentals,
  filings: Filing[]
): string {
  return `Analyze equity ticker ${symbol.toUpperCase()} using the verified data below.

Market Quote:
- Price: $${quote.price} (Change: ${quote.changePercent}%)
- Trailing P/E: ${quote.peRatio ?? 'N/A'}
- Market Cap: $${quote.marketCap}

Fundamental Disclosures:
- Statements Count: ${fundamentals.statements.length}
- Latest Revenue: $${fundamentals.statements[0]?.revenue ?? 0}
- Latest Net Income: $${fundamentals.statements[0]?.netIncome ?? 0}
- Operating Margin: ${fundamentals.metrics.operatingMargin}%
- Return on Equity: ${fundamentals.metrics.returnOnEquity}%

Recent SEC Filings:
${filings.map((f) => `- [${f.formType}] ${f.filingDate}: ${f.description}`).join('\n')}

Generate a rigorous bull case, bear case, and metric trace where each claim is tied directly to these disclosures.`;
}
