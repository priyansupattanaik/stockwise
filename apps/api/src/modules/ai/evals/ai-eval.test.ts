import { describe, it, expect, beforeEach } from 'vitest';
import { AIService } from '../ai.service';
import { AIToolRegistry } from '../ai.tool-registry';
import { MockMarketDataProvider } from '../../../providers/mock-market-data.provider';
import { AI_EVAL_FIXTURES } from './eval-fixtures';
import {
  ThesisReportSchema,
  NLScreenerOutputSchema,
  FilingDiffReportSchema,
  PortfolioRiskExplanationSchema,
  AnomalyExplanationReportSchema,
  BacktestAssistantResponseSchema,
} from '@stockan/shared';
import { PROMPT_REGISTRY } from '../prompts';

describe('AI Evaluation Suite (Golden Fixtures & Regression Tests)', () => {
  let provider: MockMarketDataProvider;
  let toolRegistry: AIToolRegistry;
  let aiService: AIService;

  beforeEach(() => {
    provider = new MockMarketDataProvider();
    toolRegistry = new AIToolRegistry(provider);
    aiService = new AIService(toolRegistry);
  });

  describe('Prompt Versioning Invariants', () => {
    it('verifies all 6 AI analytical prompts are registered and versioned', () => {
      expect(PROMPT_REGISTRY.thesis.version).toMatch(/^v\d+\.\d+\.\d+$/);
      expect(PROMPT_REGISTRY.nlScreener.version).toMatch(/^v\d+\.\d+\.\d+$/);
      expect(PROMPT_REGISTRY.filingDiff.version).toMatch(/^v\d+\.\d+\.\d+$/);
      expect(PROMPT_REGISTRY.portfolioRisk.version).toMatch(/^v\d+\.\d+\.\d+$/);
      expect(PROMPT_REGISTRY.anomalyExplainer.version).toMatch(/^v\d+\.\d+\.\d+$/);
      expect(PROMPT_REGISTRY.backtestAssistant.version).toMatch(/^v\d+\.\d+\.\d+$/);
    });
  });

  describe('Feature 1: Thesis Builder Eval', () => {
    for (const fixture of AI_EVAL_FIXTURES.thesis) {
      it(`evaluates thesis generation for ${fixture.symbol} matches data sufficiency and schema`, async () => {
        const result = await aiService.buildThesis(fixture.symbol);
        const parsed = ThesisReportSchema.safeParse(result);
        expect(parsed.success).toBe(true);

        expect(result.dataSufficiency).toBe(fixture.expectedSufficiency);
        expect(result.promptVersion).toBe(PROMPT_REGISTRY.thesis.version);
        expect(result.regulatoryNotice).toContain('Informational analysis only');

        if (fixture.expectedSufficiency === 'sufficient') {
          expect(result.keyMetricsTrace.length).toBeGreaterThanOrEqual(fixture.expectedMinCitations);
          expect(result.bullCase.points.length).toBeGreaterThanOrEqual(fixture.expectedMinBullPoints);
          expect(result.bearCase.points.length).toBeGreaterThanOrEqual(fixture.expectedMinBearPoints);

          // Traceability check: Every bull/bear point citation must match the symbol
          for (const pt of result.bullCase.points) {
            expect(pt.citation.symbol).toBe(fixture.symbol);
            expect(pt.evidence).toBeDefined();
          }
          for (const pt of result.bearCase.points) {
            expect(pt.citation.symbol).toBe(fixture.symbol);
            expect(pt.evidence).toBeDefined();
          }

          // Invariant: Metered usage and cost
          expect(result.usage.totalTokens).toBeGreaterThan(0);
          expect(result.usage.estimatedCostUsd).toBeGreaterThan(0);
        } else {
          expect(result.insufficientDataReason).toBeDefined();
        }
      });
    }
  });

  describe('Feature 2: Natural-Language Screener Eval', () => {
    for (const fixture of AI_EVAL_FIXTURES.nlScreener) {
      it(`evaluates query translation: "${fixture.prompt}"`, async () => {
        const result = await aiService.parseNLScreenerQuery(fixture.prompt);
        const parsed = NLScreenerOutputSchema.safeParse(result);
        expect(parsed.success).toBe(true);

        expect(result.promptVersion).toBe(PROMPT_REGISTRY.nlScreener.version);
        expect(result.structuredQuery.sortBy).toBe(fixture.expectedSortBy);
        expect(result.structuredQuery.sortDirection).toBe(fixture.expectedSortDirection);

        for (const expectedCrit of fixture.expectedCriteria) {
          const matched = result.structuredQuery.criteria.find(
            (c) => c.field === expectedCrit.field && c.operator === expectedCrit.operator
          );
          expect(matched).toBeDefined();
          expect(matched?.value).toEqual(expectedCrit.value);
        }

        // Test running this query against the screener engine
        const screenerResult = await provider.screen(result.structuredQuery);
        expect(screenerResult.items).toBeDefined();
      });
    }
  });

  describe('Feature 3: Filing and Earnings Diff Eval', () => {
    for (const fixture of AI_EVAL_FIXTURES.filingDiff) {
      it(`evaluates sequential filing variance for ${fixture.symbol}`, async () => {
        const result = await aiService.diffFilings(fixture.symbol);
        const parsed = FilingDiffReportSchema.safeParse(result);
        expect(parsed.success).toBe(true);

        expect(result.dataSufficiency).toBe(fixture.expectedSufficiency);
        expect(result.promptVersion).toBe(PROMPT_REGISTRY.filingDiff.version);

        if (fixture.expectedSufficiency === 'sufficient') {
          expect(result.changes.length).toBeGreaterThanOrEqual(fixture.expectedMinChanges);

          // Verify mathematical consistency of percentage change
          for (const change of result.changes) {
            const prior = Number(change.priorPeriodValue);
            const current = Number(change.currentPeriodValue);
            const calculatedDelta =
              prior > 0
                ? ((current - prior) / prior) * 100
                : 0;
            expect(change.percentChange).toBeCloseTo(calculatedDelta, 1);
            expect(['high', 'medium', 'low']).toContain(change.significance);
            expect(change.citation.symbol).toBe(fixture.symbol);
          }
        }
      });
    }
  });

  describe('Feature 4: Portfolio Risk Explainer Eval', () => {
    for (const fixture of AI_EVAL_FIXTURES.portfolioRisk) {
      it(`evaluates portfolio risk explanation for ${fixture.portfolioId}`, async () => {
        const days = 100;
        const benchmarkReturns = Array.from({ length: days }, (_, i) => Math.sin(i / 5) * 0.01);
        const historicalReturns = Array.from({ length: days }, (_, i) => Math.sin(i / 5) * 0.012);
        const returnsBySymbol: Record<string, number[]> = {};
        for (const p of fixture.positions) {
          returnsBySymbol[p.symbol] = Array.from(
            { length: days },
            (_, i) => Math.sin(i / 4 + p.symbol.charCodeAt(0)) * 0.015
          );
        }

        const result = await aiService.explainPortfolioRisk(
          fixture.portfolioId,
          fixture.positions,
          historicalReturns,
          benchmarkReturns,
          returnsBySymbol
        );

        const parsed = PortfolioRiskExplanationSchema.safeParse(result);
        expect(parsed.success).toBe(true);

        expect(result.portfolioId).toBe(fixture.portfolioId);
        expect(result.concentrationSummary).toContain(fixture.expectedTopHoldingSymbol);
        expect(result.codeComputedMetricsSummary.beta).toBeGreaterThan(0);
        expect(result.codeComputedMetricsSummary.annualizedVolatility).toBeGreaterThan(0);
        expect(result.drawdownRiskAnalysis.length).toBeGreaterThan(0);
        expect(result.regulatoryNotice).toContain('Informational analysis only');
      });
    }
  });

  describe('Feature 5: Anomaly Explainer Eval', () => {
    for (const fixture of AI_EVAL_FIXTURES.anomaly) {
      it(`evaluates anomaly detection for ${fixture.symbol}`, async () => {
        const result = await aiService.explainAnomaly(fixture.symbol);
        const parsed = AnomalyExplanationReportSchema.safeParse(result);
        expect(parsed.success).toBe(true);

        expect(result.symbol).toBe(fixture.symbol);
        expect(result.deviationMagnitudeSigma).toBeGreaterThanOrEqual(fixture.expectedMinSigma);
        expect(result.correlatedFilings.length).toBeGreaterThanOrEqual(
          fixture.expectedMinCorrelatedFilings
        );
        expect(result.synthesis).toBeDefined();
        expect(result.regulatoryNotice).toContain('Informational analysis only');
      });
    }
  });

  describe('Feature 6: Backtest Assistant Eval', () => {
    for (const fixture of AI_EVAL_FIXTURES.backtest) {
      it(`evaluates rule conversion & simulation for "${fixture.prompt}"`, async () => {
        const result = await aiService.assistBacktest(fixture.prompt, fixture.symbol);
        const parsed = BacktestAssistantResponseSchema.safeParse(result);
        expect(parsed.success).toBe(true);

        expect(result.strategySpec.symbol).toBe(fixture.symbol);
        expect(result.strategySpec.entryConditions.length).toBeGreaterThan(0);
        expect(result.strategySpec.entryConditions[0]?.indicator).toBe(fixture.expectedIndicator);
        expect(result.strategySpec.entryConditions[0]?.operator).toBe(fixture.expectedEntryOperator);

        // Deterministic backtest execution verification
        expect(result.backtestResult.symbol).toBe(fixture.symbol);
        expect(result.backtestResult.equityCurve.length).toBeGreaterThan(0);
        expect(result.backtestResult.regulatoryNotice).toContain('Past performance');
      });
    }
  });
});
