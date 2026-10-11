'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/table';
import { EquityCurveChart } from '../../components/charts/equity-curve-chart';
import { useSettingsStore } from '../../stores/use-settings-store';
import { formatCurrency, formatPercent, formatDate } from '../../lib/formatters';
import { STRINGS } from '../../content/strings';
import {
  Cpu,
  FileCheck2,
  Filter,
  Diff,
  ShieldAlert,
  Zap,
  Play,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import type {
  ThesisReport,
  NLScreenerOutput,
  FilingDiffReport,
  PortfolioRiskExplanation,
  AnomalyExplanationReport,
  BacktestAssistantResponse,
} from '@stockan/shared';

function ResearchWorkspaceContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') ?? 'thesis';
  const initialSymbol = (searchParams.get('symbol') ?? 'AAPL').toUpperCase();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [symbol, setSymbol] = useState(initialSymbol);
  const [nlQuery, setNlQuery] = useState('large cap tech stocks with low pe and dividends');
  const [backtestDescription, setBacktestDescription] = useState(
    'Buy when 20-day SMA crosses above price, sell when it drops below'
  );

  const { recordTokens } = useSettingsStore();

  // 1. Thesis Mutation
  const thesisMutation = useMutation({
    mutationFn: (sym: string) => api.getThesis(sym),
    onSuccess: (data) => {
      recordTokens(data.usage.totalTokens, data.usage.estimatedCostUsd);
    },
  });

  // 2. NL Screener Mutation
  const nlScreenerMutation = useMutation({
    mutationFn: (q: string) => api.parseNLScreener(q),
    onSuccess: (data) => {
      recordTokens(data.usage.totalTokens, data.usage.estimatedCostUsd);
    },
  });

  // 3. Filing Diff Mutation
  const diffMutation = useMutation({
    mutationFn: (sym: string) => api.diffFilings(sym),
    onSuccess: (data) => {
      recordTokens(data.usage.totalTokens, data.usage.estimatedCostUsd);
    },
  });

  // 4. Portfolio Risk Explanation
  const { data: portfolio } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => api.getPortfolio(),
  });

  const riskMutation = useMutation({
    mutationFn: () =>
      api.explainPortfolioRisk(
        portfolio?.id ?? 'portfolio-main',
        portfolio?.positions ?? []
      ),
    onSuccess: (data) => {
      recordTokens(data.usage.totalTokens, data.usage.estimatedCostUsd);
    },
  });

  // 5. Anomaly Mutation
  const anomalyMutation = useMutation({
    mutationFn: (sym: string) => api.explainAnomaly(sym),
    onSuccess: (data) => {
      recordTokens(data.usage.totalTokens, data.usage.estimatedCostUsd);
    },
  });

  // 6. Backtest Mutation
  const backtestMutation = useMutation({
    mutationFn: ({ desc, sym }: { desc: string; sym: string }) =>
      api.assistBacktest(desc, sym),
    onSuccess: (data) => {
      recordTokens(data.usage.totalTokens, data.usage.estimatedCostUsd);
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Cpu className="w-5 h-5 text-foreground" />
            <span>{STRINGS.research.title}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {STRINGS.research.subtitle}
          </p>
        </div>

        <Badge variant="outline" className="text-muted-foreground font-mono text-[11px] py-1">
          Deterministic Tool Registry Active
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="thesis" className="gap-1.5">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>{STRINGS.research.thesisTab}</span>
          </TabsTrigger>
          <TabsTrigger value="screener" className="gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            <span>{STRINGS.research.screenerTab}</span>
          </TabsTrigger>
          <TabsTrigger value="diff" className="gap-1.5">
            <Diff className="w-3.5 h-3.5" />
            <span>{STRINGS.research.filingDiffTab}</span>
          </TabsTrigger>
          <TabsTrigger value="risk" className="gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{STRINGS.research.riskTab}</span>
          </TabsTrigger>
          <TabsTrigger value="anomaly" className="gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>{STRINGS.research.anomalyTab}</span>
          </TabsTrigger>
          <TabsTrigger value="backtest" className="gap-1.5">
            <Play className="w-3.5 h-3.5" />
            <span>{STRINGS.research.backtestTab}</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. THESIS BUILDER TAB */}
        <TabsContent value="thesis" className="space-y-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Thesis Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3 pt-0">
              <Input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder={STRINGS.research.symbolPlaceholder}
                className="w-36 uppercase h-8 text-xs font-mono"
              />
              <Button
                size="sm"
                onClick={() => thesisMutation.mutate(symbol)}
                disabled={thesisMutation.isPending}
              >
                {thesisMutation.isPending ? 'Executing Tool Calls...' : STRINGS.research.runAnalysis}
              </Button>
            </CardContent>
          </Card>

          {thesisMutation.data && (
            <div className="space-y-4">
              {/* Tool Execution Provenance */}
              <div className="flex items-center justify-between p-3 rounded-md bg-muted/40 border border-border text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">Provenance:</span>
                  <span className="text-muted-foreground">
                    Prompt {thesisMutation.data.promptVersion}
                  </span>
                  <span className="text-muted-foreground">|</span>
                  <span className="text-muted-foreground">
                    {thesisMutation.data.toolCalls.length} tool invocations
                  </span>
                </div>
                <div className="font-mono text-muted-foreground tabular-nums">
                  {thesisMutation.data.usage.totalTokens} tokens ($
                  {thesisMutation.data.usage.estimatedCostUsd.toFixed(5)})
                </div>
              </div>

              {/* Bull and Bear Cases Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bull Case */}
                <Card className="border-gain/30">
                  <CardHeader className="py-3 border-b border-border/60">
                    <CardTitle className="text-xs uppercase tracking-wider text-gain flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Bull Thesis Evidence</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4">
                    <p className="text-xs font-medium text-foreground">
                      {thesisMutation.data.bullCase.summary}
                    </p>
                    <div className="space-y-2.5">
                      {thesisMutation.data.bullCase.points.map((pt, i) => (
                        <div key={i} className="p-2.5 rounded bg-muted/30 border border-border/60 text-xs">
                          <p className="font-semibold text-foreground">{pt.claim}</p>
                          <p className="text-[11px] text-muted-foreground mt-1">{pt.evidence}</p>
                          <div className="mt-2 pt-1 border-t border-border/40 text-[10px] font-mono text-muted-foreground flex items-center justify-between">
                            <span>Source: {pt.citation.sourceType} ({pt.citation.field})</span>
                            <span>{formatDate(pt.citation.timestamp)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Bear Case */}
                <Card className="border-loss/30">
                  <CardHeader className="py-3 border-b border-border/60">
                    <CardTitle className="text-xs uppercase tracking-wider text-loss flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Bear Thesis Evidence</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4">
                    <p className="text-xs font-medium text-foreground">
                      {thesisMutation.data.bearCase.summary}
                    </p>
                    <div className="space-y-2.5">
                      {thesisMutation.data.bearCase.points.map((pt, i) => (
                        <div key={i} className="p-2.5 rounded bg-muted/30 border border-border/60 text-xs">
                          <p className="font-semibold text-foreground">{pt.claim}</p>
                          <p className="text-[11px] text-muted-foreground mt-1">{pt.evidence}</p>
                          <div className="mt-2 pt-1 border-t border-border/40 text-[10px] font-mono text-muted-foreground flex items-center justify-between">
                            <span>Source: {pt.citation.sourceType} ({pt.citation.field})</span>
                            <span>{formatDate(pt.citation.timestamp)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Informational Notice */}
              <div className="p-3 border border-border rounded bg-muted/20 text-[11px] text-muted-foreground">
                {thesisMutation.data.regulatoryNotice}
              </div>
            </div>
          )}
        </TabsContent>

        {/* 2. NATURAL-LANGUAGE SCREENER TAB */}
        <TabsContent value="screener" className="space-y-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Natural-Language Screener Query
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <Input
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                placeholder={STRINGS.research.nlScreenerPlaceholder}
                className="h-9 text-xs"
              />
              <Button
                size="sm"
                onClick={() => nlScreenerMutation.mutate(nlQuery)}
                disabled={nlScreenerMutation.isPending}
              >
                {nlScreenerMutation.isPending ? 'Validating AST...' : 'Translate & Validate Query'}
              </Button>
            </CardContent>
          </Card>

          {nlScreenerMutation.data && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                    Query Interpretation & AST
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <p className="text-xs font-medium text-foreground">
                    {nlScreenerMutation.data.queryInterpretation}
                  </p>
                  <pre className="p-3 bg-muted rounded-md text-[11px] font-mono overflow-x-auto text-foreground">
                    {JSON.stringify(nlScreenerMutation.data.structuredQuery, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* 3. FILING AND EARNINGS DIFF TAB */}
        <TabsContent value="diff" className="space-y-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Filing Diff Target
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3 pt-0">
              <Input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="Ticker"
                className="w-36 uppercase h-8 text-xs font-mono"
              />
              <Button
                size="sm"
                onClick={() => diffMutation.mutate(symbol)}
                disabled={diffMutation.isPending}
              >
                {diffMutation.isPending ? 'Diffing Periods...' : 'Compare Sequential Filings'}
              </Button>
            </CardContent>
          </Card>

          {diffMutation.data && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                    Material Statement Shifts
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Metric</TableHead>
                        <TableHead className="text-right">Prior Period</TableHead>
                        <TableHead className="text-right">Current Period</TableHead>
                        <TableHead className="text-right">Shift %</TableHead>
                        <TableHead>Material Significance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {diffMutation.data.changes.map((chg, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-semibold text-foreground">
                            {chg.metricOrSection}
                          </TableCell>
                          <TableCell className="text-right font-mono text-muted-foreground">
                            {formatCurrency(Number(chg.priorPeriodValue), true)}
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium text-foreground">
                            {formatCurrency(Number(chg.currentPeriodValue), true)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatPercent(chg.percentChange)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={chg.significance === 'high' ? 'border-loss text-loss' : ''}
                            >
                              {chg.significance.toUpperCase()}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* 4. PORTFOLIO RISK ANALYSIS EXPLAINER */}
        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Portfolio Risk Engine Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                size="sm"
                onClick={() => riskMutation.mutate()}
                disabled={riskMutation.isPending}
              >
                {riskMutation.isPending ? 'Synthesizing Stress Tests...' : 'Explain Portfolio Vulnerabilities'}
              </Button>
            </CardContent>
          </Card>

          {riskMutation.data && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <span className="text-[11px] text-muted-foreground uppercase font-medium">
                    Position Concentration
                  </span>
                  <p className="text-xs text-foreground mt-2 leading-relaxed">
                    {riskMutation.data.concentrationSummary}
                  </p>
                </Card>
                <Card className="p-4">
                  <span className="text-[11px] text-muted-foreground uppercase font-medium">
                    Sector Sensitivity
                  </span>
                  <p className="text-xs text-foreground mt-2 leading-relaxed">
                    {riskMutation.data.sectorExposureSummary}
                  </p>
                </Card>
                <Card className="p-4">
                  <span className="text-[11px] text-muted-foreground uppercase font-medium">
                    Drawdown Scenario Impact
                  </span>
                  <p className="text-xs text-foreground mt-2 leading-relaxed">
                    {riskMutation.data.drawdownRiskAnalysis}
                  </p>
                </Card>
              </div>

              <div className="p-3 border border-border rounded bg-muted/20 text-[11px] text-muted-foreground">
                {riskMutation.data.regulatoryNotice}
              </div>
            </div>
          )}
        </TabsContent>

        {/* 5. ANOMALY EXPLAINER TAB */}
        <TabsContent value="anomaly" className="space-y-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Volume / Price Anomaly Scan
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3 pt-0">
              <Input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="Ticker"
                className="w-36 uppercase h-8 text-xs font-mono"
              />
              <Button
                size="sm"
                onClick={() => anomalyMutation.mutate(symbol)}
                disabled={anomalyMutation.isPending}
              >
                {anomalyMutation.isPending ? 'Scanning Standard Deviations...' : 'Explain Anomaly'}
              </Button>
            </CardContent>
          </Card>

          {anomalyMutation.data && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                      Detected Anomaly Signature
                    </CardTitle>
                    <Badge variant="outline" className="font-mono text-loss">
                      {anomalyMutation.data.anomalyType} ({anomalyMutation.data.deviationMagnitudeSigma}σ)
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <p className="text-xs font-medium text-foreground leading-relaxed">
                    {anomalyMutation.data.synthesis}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* 6. BACKTEST ASSISTANT TAB */}
        <TabsContent value="backtest" className="space-y-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Strategy Spec Generator & Deterministic Engine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex items-center gap-3">
                <Input
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder="Ticker"
                  className="w-36 uppercase h-8 text-xs font-mono"
                />
                <Input
                  value={backtestDescription}
                  onChange={(e) => setBacktestDescription(e.target.value)}
                  placeholder={STRINGS.research.backtestPlaceholder}
                  className="flex-1 h-8 text-xs"
                />
              </div>
              <Button
                size="sm"
                onClick={() =>
                  backtestMutation.mutate({ desc: backtestDescription, sym: symbol })
                }
                disabled={backtestMutation.isPending}
              >
                {backtestMutation.isPending ? 'Running Simulation...' : 'Compile Spec & Run Engine'}
              </Button>
            </CardContent>
          </Card>

          {backtestMutation.data && (
            <div className="space-y-4">
              {/* Backtest Performance Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card className="p-3">
                  <span className="text-[10px] text-muted-foreground uppercase">Total Return</span>
                  <p className="text-base font-bold font-mono text-foreground mt-0.5">
                    {formatPercent(backtestMutation.data.backtestResult.totalReturnPercent)}
                  </p>
                </Card>
                <Card className="p-3">
                  <span className="text-[10px] text-muted-foreground uppercase">Sharpe Ratio</span>
                  <p className="text-base font-bold font-mono text-foreground mt-0.5">
                    {backtestMutation.data.backtestResult.sharpeRatio}
                  </p>
                </Card>
                <Card className="p-3">
                  <span className="text-[10px] text-muted-foreground uppercase">Max Drawdown</span>
                  <p className="text-base font-bold font-mono text-loss mt-0.5">
                    -{backtestMutation.data.backtestResult.maxDrawdownPercent}%
                  </p>
                </Card>
                <Card className="p-3">
                  <span className="text-[10px] text-muted-foreground uppercase">Win Rate</span>
                  <p className="text-base font-bold font-mono text-foreground mt-0.5">
                    {backtestMutation.data.backtestResult.winRatePercent.toFixed(1)}%
                  </p>
                </Card>
                <Card className="p-3">
                  <span className="text-[10px] text-muted-foreground uppercase">Total Trades</span>
                  <p className="text-base font-bold font-mono text-foreground mt-0.5">
                    {backtestMutation.data.backtestResult.totalTrades}
                  </p>
                </Card>
                <Card className="p-3">
                  <span className="text-[10px] text-muted-foreground uppercase">Ending Capital</span>
                  <p className="text-base font-bold font-mono text-foreground mt-0.5">
                    {formatCurrency(backtestMutation.data.backtestResult.endingCapital)}
                  </p>
                </Card>
              </div>

              {/* Equity Curve Chart */}
              <EquityCurveChart
                data={backtestMutation.data.backtestResult.equityCurve}
                height={280}
              />

              <div className="p-3 border border-border rounded bg-muted/20 text-[11px] text-muted-foreground">
                {backtestMutation.data.backtestResult.regulatoryNotice}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ResearchPage() {
  return (
    <React.Suspense
      fallback={
        <div className="space-y-4 max-w-7xl mx-auto">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      }
    >
      <ResearchWorkspaceContent />
    </React.Suspense>
  );
}
