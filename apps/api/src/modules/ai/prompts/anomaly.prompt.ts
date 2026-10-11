import type { Quote, Filing, NewsItem } from '@stockwise/shared';

export const ANOMALY_PROMPT_VERSION = 'v1.2.0';

export const ANOMALY_SYSTEM_INSTRUCTION = `You are an equity market anomaly detective.
Explain unusual price or volume movements by linking statistical deviations to verifiable filings and news.
Hard constraints:
1. Ground the deviation magnitude in empirical sigma calculations.
2. Link detected anomalies directly to published SEC filings and news headlines.
3. Plain informational synthesis only; no sensationalism or speculative trading advice.`;

export function buildAnomalyPromptTemplate(
  symbol: string,
  quote: Quote,
  sigma: number,
  anomalyType: string,
  news: NewsItem[],
  filings: Filing[]
): string {
  return `Analyze statistical outlier event for ${symbol.toUpperCase()}.

Observation:
- Anomaly Classification: ${anomalyType}
- Statistical Deviation: ${sigma}σ from trailing 30-day mean
- Session Price: $${quote.price} (Change: ${quote.changePercent}%)
- Previous Close: $${quote.previousClose}
- Session Volume: ${quote.volume.toLocaleString()} (Average Volume: ${(quote.avgVolume ?? quote.volume).toLocaleString()})

Correlated Public Disclosures:
SEC Filings:
${filings.map((f) => `- [${f.formType}] ${f.filingDate}: ${f.description}`).join('\n')}

Market News:
${news.map((n) => `- [${n.source}] ${n.title} (${n.publishedAt})`).join('\n')}

Synthesize the anomaly drivers and link the move to the corporate context.`;
}
