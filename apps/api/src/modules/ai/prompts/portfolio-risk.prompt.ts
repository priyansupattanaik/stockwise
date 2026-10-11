import type { PortfolioRiskMetrics, Position } from '@stockwise/shared';

export const PORTFOLIO_RISK_PROMPT_VERSION = 'v1.1.0';

export const PORTFOLIO_RISK_SYSTEM_INSTRUCTION = `You are a quantitative portfolio risk analyst.
Explain deterministic code-computed risk metrics to investment stakeholders.
Hard constraints:
1. Never hallucinate risk metrics; all values (Beta, Volatility, VaR, Max Drawdown) are computed by deterministic code.
2. Clearly identify single-holding concentration (>15% weight) and top sector concentration (>30%).
3. Explain macroeconomic shock stress scenarios directly from modeled loss values.
4. Strictly no buy/sell directives; maintain neutral informational commentary.`;

export function buildPortfolioRiskPromptTemplate(
  portfolioId: string,
  metrics: PortfolioRiskMetrics,
  positions: Position[]
): string {
  return `Synthesize risk assessment for Portfolio "${portfolioId}".

Code-Computed Quantitative Metrics:
- Total Capitalization: $${metrics.totalValue.toLocaleString()}
- Portfolio Beta (vs SPY): ${metrics.beta}
- Annualized Volatility: ${(metrics.annualizedVolatility * 100).toFixed(1)}%
- Sharpe Ratio: ${metrics.sharpeRatio}
- Sortino Ratio: ${metrics.sortinoRatio}
- Maximum Drawdown: ${(metrics.maxDrawdown * 100).toFixed(1)}%
- Historical VaR (95% 1-day): ${(metrics.var95Historical * 100).toFixed(2)}%
- Expected Shortfall CVaR (95%): ${(metrics.cvar95Historical * 100).toFixed(2)}%

Holdings (${positions.length} active):
${positions.map((p) => `- ${p.symbol}: ${p.weightPercent}% ($${p.marketValue.toLocaleString()})`).join('\n')}

Top Sector Exposures:
${metrics.sectorExposures.map((s) => `- ${s.sector}: ${s.weightPercent}%`).join('\n')}

Macroeconomic Stress Scenarios:
${metrics.drawdownScenarios.map((d) => `- ${d.name} (${d.marketShockPercent}%): ${d.estimatedPortfolioImpactPercent}% impact ($${d.estimatedPortfolioLossValue.toLocaleString()} loss)`).join('\n')}

Provide an executive synthesis of concentrations, drawdown exposures, and holding vulnerabilities.`;
}
