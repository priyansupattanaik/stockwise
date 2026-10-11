'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { CandlestickChart } from '../../../components/charts/candlestick-chart';
import { GainLossBadge } from '../../../components/ui/gain-loss-badge';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../../components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import { formatCurrency, formatPercent, formatNumber, formatDate } from '../../../lib/formatters';
import { STRINGS } from '../../../content/strings';
import { Clock, Cpu, ExternalLink, BookmarkPlus } from 'lucide-react';
import type { HistoryRange } from '@stockwise/shared';

export default function SymbolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = (typeof params.symbol === 'string' ? params.symbol : 'AAPL').toUpperCase();

  const [range, setRange] = useState<HistoryRange>('1y');

  const { data: quote, isLoading: loadingQuote } = useQuery({
    queryKey: ['quote', symbol],
    queryFn: () => api.getQuote(symbol),
  });

  const { data: history, isLoading: loadingHistory } = useQuery({
    queryKey: ['history', symbol, range],
    queryFn: () => api.getHistory(symbol, '1d', range),
  });

  const { data: fundamentals, isLoading: loadingFundamentals } = useQuery({
    queryKey: ['fundamentals', symbol],
    queryFn: () => api.getFundamentals(symbol),
  });

  const { data: filings, isLoading: loadingFilings } = useQuery({
    queryKey: ['filings', symbol],
    queryFn: () => api.getFilings(symbol),
  });

  if (loadingQuote) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-16 w-1/3" />
        <Skeleton className="h-[380px] w-full" />
      </div>
    );
  }

  const m = fundamentals?.metrics;
  const statements = fundamentals?.statements ?? [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono text-foreground tracking-tight">
              {quote?.symbol ?? symbol}
            </h1>
            <Badge variant="outline" className="gap-1 font-normal text-muted-foreground">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span>{STRINGS.symbolDetail.delayedBadge}</span>
            </Badge>
            <Badge variant="secondary" className="font-normal">
              {fundamentals?.profile.sector ?? 'US Equities'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {quote?.companyName} — {fundamentals?.profile.industry}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-2xl font-bold font-mono tabular-nums text-foreground">
              {formatCurrency(quote?.price)}
            </div>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <GainLossBadge value={quote?.changePercent} />
              <span className="text-xs font-mono text-muted-foreground tabular-nums">
                ({quote?.change && quote.change > 0 ? '+' : ''}
                {quote?.change?.toFixed(2)})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/research?symbol=${symbol}&tab=thesis`)}
              className="gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
              <span>AI Thesis</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Candlestick Chart with Range Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Price Chart & Volume
          </span>
          <div className="flex items-center gap-1 bg-muted p-0.5 rounded-md">
            {(['1m', '3m', '6m', '1y', '5y'] as HistoryRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 text-xs font-medium rounded ${
                  range === r
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {loadingHistory ? (
          <Skeleton className="h-[380px] w-full rounded-lg" />
        ) : (
          <CandlestickChart data={history ?? []} height={380} />
        )}
      </div>

      {/* Key Stats and Ratios Grid */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
            {STRINGS.symbolDetail.keyStats}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="border border-border/80 rounded p-2.5 bg-muted/20">
              <span className="text-[11px] text-muted-foreground block">{STRINGS.symbolDetail.peRatioTTM}</span>
              <span className="text-sm font-semibold font-mono text-foreground mt-0.5 block">
                {m?.peRatioTTM ? `${m.peRatioTTM}x` : '—'}
              </span>
            </div>
            <div className="border border-border/80 rounded p-2.5 bg-muted/20">
              <span className="text-[11px] text-muted-foreground block">{STRINGS.symbolDetail.forwardPE}</span>
              <span className="text-sm font-semibold font-mono text-foreground mt-0.5 block">
                {m?.forwardPE ? `${m.forwardPE}x` : '—'}
              </span>
            </div>
            <div className="border border-border/80 rounded p-2.5 bg-muted/20">
              <span className="text-[11px] text-muted-foreground block">{STRINGS.symbolDetail.pbRatio}</span>
              <span className="text-sm font-semibold font-mono text-foreground mt-0.5 block">
                {m?.pbRatio ? `${m.pbRatio}x` : '—'}
              </span>
            </div>
            <div className="border border-border/80 rounded p-2.5 bg-muted/20">
              <span className="text-[11px] text-muted-foreground block">{STRINGS.symbolDetail.psRatio}</span>
              <span className="text-sm font-semibold font-mono text-foreground mt-0.5 block">
                {m?.psRatio ? `${m.psRatio}x` : '—'}
              </span>
            </div>
            <div className="border border-border/80 rounded p-2.5 bg-muted/20">
              <span className="text-[11px] text-muted-foreground block">{STRINGS.symbolDetail.dividendYield}</span>
              <span className="text-sm font-semibold font-mono text-foreground mt-0.5 block">
                {m?.dividendYield ? `${m.dividendYield}%` : '0.00%'}
              </span>
            </div>
            <div className="border border-border/80 rounded p-2.5 bg-muted/20">
              <span className="text-[11px] text-muted-foreground block">{STRINGS.symbolDetail.beta}</span>
              <span className="text-sm font-semibold font-mono text-foreground mt-0.5 block">
                {m?.beta ? m.beta.toFixed(2) : '1.00'}
              </span>
            </div>
            <div className="border border-border/80 rounded p-2.5 bg-muted/20">
              <span className="text-[11px] text-muted-foreground block">{STRINGS.symbolDetail.marketCap}</span>
              <span className="text-sm font-semibold font-mono text-foreground mt-0.5 block">
                {formatCurrency(quote?.marketCap, true)}
              </span>
            </div>
            <div className="border border-border/80 rounded p-2.5 bg-muted/20">
              <span className="text-[11px] text-muted-foreground block">{STRINGS.symbolDetail.volume}</span>
              <span className="text-sm font-semibold font-mono text-foreground mt-0.5 block">
                {formatNumber(quote?.volume, true)}
              </span>
            </div>
            <div className="border border-border/80 rounded p-2.5 bg-muted/20">
              <span className="text-[11px] text-muted-foreground block">52W High</span>
              <span className="text-sm font-semibold font-mono text-foreground mt-0.5 block">
                {formatCurrency(quote?.week52High)}
              </span>
            </div>
            <div className="border border-border/80 rounded p-2.5 bg-muted/20">
              <span className="text-[11px] text-muted-foreground block">52W Low</span>
              <span className="text-sm font-semibold font-mono text-foreground mt-0.5 block">
                {formatCurrency(quote?.week52Low)}
              </span>
            </div>
            <div className="border border-border/80 rounded p-2.5 bg-muted/20">
              <span className="text-[11px] text-muted-foreground block">Operating Margin</span>
              <span className="text-sm font-semibold font-mono text-foreground mt-0.5 block">
                {m?.operatingMargin ? `${m.operatingMargin}%` : '—'}
              </span>
            </div>
            <div className="border border-border/80 rounded p-2.5 bg-muted/20">
              <span className="text-[11px] text-muted-foreground block">Return on Equity</span>
              <span className="text-sm font-semibold font-mono text-foreground mt-0.5 block">
                {m?.returnOnEquity ? `${m.returnOnEquity}%` : '—'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Statements & SEC Filings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Statements */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              {STRINGS.symbolDetail.financialStatements}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingFundamentals ? (
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : statements.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Net Income</TableHead>
                    <TableHead className="text-right">Op. Cash Flow</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statements.map((stmt, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-semibold text-foreground">
                        {stmt.period} ({formatDate(stmt.date)})
                      </TableCell>
                      <TableCell className="text-right font-mono text-foreground">
                        {formatCurrency(stmt.revenue, true)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-foreground">
                        {formatCurrency(stmt.netIncome, true)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {stmt.operatingCashFlow ? formatCurrency(stmt.operatingCashFlow, true) : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-xs text-muted-foreground p-4">No financial disclosures recorded.</p>
            )}
          </CardContent>
        </Card>

        {/* SEC Filings */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              {STRINGS.symbolDetail.filingsHeading}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingFilings ? (
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : filings && filings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Form</TableHead>
                    <TableHead>Filing Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">SEC Edgar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filings.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-mono font-bold text-foreground">
                        {f.formType}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-[11px]">
                        {formatDate(f.filingDate)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-[11px] max-w-xs truncate">
                        {f.description}
                      </TableCell>
                      <TableCell className="text-right">
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-foreground font-medium hover:underline inline-flex items-center gap-1"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3 text-muted-foreground" />
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-xs text-muted-foreground p-4">{STRINGS.symbolDetail.noFilings}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
