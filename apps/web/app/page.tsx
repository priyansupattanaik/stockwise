'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table';
import { GainLossBadge } from '../components/ui/gain-loss-badge';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { MiniSparkline } from '../components/charts/mini-sparkline';
import { formatCurrency, formatNumber, formatDate } from '../lib/formatters';
import { STRINGS } from '../content/strings';
import { TrendingUp, Calendar, FileText, ArrowRight } from 'lucide-react';

const MARKET_INDICES = [
  { symbol: 'SPY', name: 'S&P 500 ETF', price: 585.4, change: 3.25, changePct: 0.56, history: [580, 581, 583, 582, 584, 585.4] },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', price: 498.2, change: 4.8, changePct: 0.97, history: [490, 492, 491, 495, 496, 498.2] },
  { symbol: 'DIA', name: 'SPDR Dow Jones', price: 432.1, change: -0.45, changePct: -0.1, history: [434, 433, 435, 432, 433, 432.1] },
  { symbol: 'IWM', name: 'Russell 2000 ETF', price: 218.6, change: 1.15, changePct: 0.53, history: [215, 216, 215.5, 217, 218.6] },
];

export default function DashboardPage() {
  const { data: screenerResult, isLoading: loadingScreener } = useQuery({
    queryKey: ['dashboard-screener'],
    queryFn: () =>
      api.runScreener({
        criteria: [],
        sortBy: 'marketCap',
        sortDirection: 'desc',
        limit: 10,
        offset: 0,
      }),
  });

  const { data: earnings, isLoading: loadingEarnings } = useQuery({
    queryKey: ['dashboard-earnings'],
    queryFn: () => api.getEarnings(),
  });

  const { data: news, isLoading: loadingNews } = useQuery({
    queryKey: ['dashboard-news'],
    queryFn: () => api.getNews(),
  });

  const stocks = screenerResult?.items ?? [];
  const topGainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const activeVolume = [...stocks].sort((a, b) => b.volume - a.volume).slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {STRINGS.dashboard.title}
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {STRINGS.dashboard.subtitle}
        </p>
      </div>

      {/* Market Indices Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MARKET_INDICES.map((idx) => (
          <Card key={idx.symbol} className="p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs tracking-wider text-muted-foreground">
                  {idx.symbol}
                </span>
                <GainLossBadge value={idx.changePct} />
              </div>
              <p className="text-lg font-bold font-mono tabular-nums text-foreground mt-1">
                ${idx.price.toFixed(2)}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">{idx.name}</p>
            </div>
            <div className="pt-3">
              <MiniSparkline data={idx.history} width={180} height={24} isPositive={idx.changePct >= 0} />
            </div>
          </Card>
        ))}
      </div>

      {/* Main Grid: Equities & Movers + Calendar & Filings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Movers & Active Volume */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Market Leaders & Active Equities
              </CardTitle>
              <Link
                href="/screener"
                className="text-xs text-foreground font-medium hover:underline inline-flex items-center gap-1"
              >
                <span>View Screener</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {loadingScreener ? (
                <div className="p-4 space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                      <TableHead className="text-right">Market Cap</TableHead>
                      <TableHead className="text-right">P/E (TTM)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stocks.slice(0, 7).map((item) => (
                      <TableRow key={item.symbol}>
                        <TableCell className="font-semibold">
                          <Link
                            href={`/symbol/${item.symbol}`}
                            className="hover:underline text-foreground"
                          >
                            {item.symbol}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-[11px]">
                          {item.sector}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {formatCurrency(item.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          <GainLossBadge value={item.changePercent} />
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">
                          {formatCurrency(item.marketCap, true)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">
                          {item.peRatioTTM ? `${item.peRatioTTM}x` : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Recent News & Regulatory Disclosures */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                <span>{STRINGS.dashboard.recentNews}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {loadingNews ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : news && news.length > 0 ? (
                news.slice(0, 4).map((n) => (
                  <div
                    key={n.id}
                    className="p-3 border border-border/80 rounded-md bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                      <span className="font-medium text-foreground">{n.symbol ?? 'MARKET'}</span>
                      <span>{formatDate(n.publishedAt)}</span>
                    </div>
                    <h4 className="text-xs font-medium text-foreground leading-snug">
                      {n.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                      {n.summary}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-2">{STRINGS.dashboard.emptyNews}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Earnings Calendar & Top Movers */}
        <div className="space-y-6">
          {/* Earnings Calendar */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>{STRINGS.dashboard.earningsCalendar}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingEarnings ? (
                <div className="p-4 space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Report Date</TableHead>
                      <TableHead className="text-right">Est. EPS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(earnings ?? []).slice(0, 5).map((e, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-semibold">
                          <Link href={`/symbol/${e.symbol}`} className="hover:underline">
                            {e.symbol}
                          </Link>
                        </TableCell>
                        <TableCell className="text-[11px] text-muted-foreground">
                          {formatDate(e.reportDate)} ({e.timeOfDay.toUpperCase()})
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">
                          {e.estimatedEPS !== null && e.estimatedEPS !== undefined
                            ? `$${e.estimatedEPS.toFixed(2)}`
                            : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Session Top Movers */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Session Top Movers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topGainers.map((item) => (
                    <TableRow key={item.symbol}>
                      <TableCell className="font-semibold">
                        <Link href={`/symbol/${item.symbol}`} className="hover:underline">
                          {item.symbol}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(item.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        <GainLossBadge value={item.changePercent} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
