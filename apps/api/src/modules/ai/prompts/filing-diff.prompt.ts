import type { FinancialStatementItem, Filing } from '@stockan/shared';

export const FILING_DIFF_PROMPT_VERSION = 'v1.3.0';

export const FILING_DIFF_SYSTEM_INSTRUCTION = `You are a corporate filing comparison auditor.
Compare current period SEC filings and financial statements against the immediately preceding period.
Hard constraints:
1. Compute percentage delta mathematically: ((current - prior) / prior) * 100.
2. Tag changes with delta > 10% as high significance, otherwise medium.
3. Every material change must link to its respective filing date and field citation.
4. Emit insufficient_data if fewer than two comparative periods are available.`;

export function buildFilingDiffPromptTemplate(
  symbol: string,
  currentStatement: FinancialStatementItem,
  priorStatement: FinancialStatementItem,
  filings: Filing[]
): string {
  return `Perform sequential disclosure diff for ${symbol.toUpperCase()}.

Prior Period (${priorStatement.period} - ${priorStatement.date}):
- Revenue: $${priorStatement.revenue}
- Net Income: $${priorStatement.netIncome}
- Operating Income: $${priorStatement.operatingIncome}
- Total Debt: $${priorStatement.totalDebt}

Current Period (${currentStatement.period} - ${currentStatement.date}):
- Revenue: $${currentStatement.revenue}
- Net Income: $${currentStatement.netIncome}
- Operating Income: $${currentStatement.operatingIncome}
- Total Debt: $${currentStatement.totalDebt}

SEC Filings Context:
${filings.map((f) => `- [${f.formType}] ${f.filingDate}`).join('\n')}

Identify material changes, calculate deltas, and summarize risk factor shifts.`;
}
