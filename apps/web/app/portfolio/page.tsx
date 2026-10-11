'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/table';
import { GainLossBadge } from '../../components/ui/gain-loss-badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Skeleton } from '../../components/ui/skeleton';
import { formatCurrency, formatPercent } from '../../lib/formatters';
import { STRINGS } from '../../content/strings';
import { Briefcase, Plus, Trash2, ShieldAlert, Cpu } from 'lucide-react';

export default function PortfolioPage() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState('');
  const [averageCost, setAverageCost] = useState('');

  const { data: portfolio, isLoading: loadingPortfolio } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => api.getPortfolio(),
  });

  const { data: risk, isLoading: loadingRisk } = useQuery({
    queryKey: ['portfolio-risk'],
    queryFn: () => api.getPortfolioRisk(),
  });

  const addPositionMutation = useMutation({
    mutationFn: (data: { symbol: string; shares: number; averageCost: number }) =>
      api.addPosition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-risk'] });
      setSymbol('');
      setShares('');
      setAverageCost('');
      setShowAddForm(false);
    },
  });

  const deletePositionMutation = useMutation({
    mutationFn: (id: string) => api.deletePosition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-risk'] });
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !shares || !averageCost) return;
    addPositionMutation.mutate({
      symbol: symbol.trim().toUpperCase(),
      shares: Number(shares),
      averageCost: Number(averageCost),
    });
  };

  const positions = portfolio?.positions ?? [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {STRINGS.portfolio.title}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {STRINGS.portfolio.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/research?tab=risk">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
              <span>AI Risk Explainer</span>
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="gap-1.5 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{STRINGS.portfolio.addPosition}</span>
          </Button>
        </div>
      </div>

      {/* Add Position Form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="p-4 bg-muted/40 border border-border rounded-lg flex flex-wrap items-center gap-3">
          <Input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Ticker (e.g. AAPL)"
            className="w-36 uppercase text-xs h-8"
          />
          <Input
            type="number"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            placeholder="Shares"
            className="w-28 text-xs h-8"
          />
          <Input
            type="number"
            step="0.01"
            value={averageCost}
            onChange={(e) => setAverageCost(e.target.value)}
            placeholder="Avg Cost ($)"
            className="w-32 text-xs h-8"
          />
          <Button type="submit" size="sm" disabled={addPositionMutation.isPending}>
            Record Position
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAddForm(false)}
          >
            Cancel
          </Button>
        </form>
      )}

      {/* Code-Computed Risk Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <span className="text-[11px] text-muted-foreground uppercase font-medium">Total Portfolio Value</span>
          <p className="text-lg font-bold font-mono text-foreground mt-1">
            {formatCurrency(risk?.totalValue)}
          </p>
          <div className="mt-1">
            <GainLossBadge value={risk?.totalGainPercent} />
          </div>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] text-muted-foreground uppercase font-medium">Beta (vs SPY)</span>
          <p className="text-lg font-bold font-mono text-foreground mt-1">
            {risk?.beta?.toFixed(2) ?? '—'}
          </p>
          <span className="text-[10px] text-muted-foreground">Market covariance sensitivity</span>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] text-muted-foreground uppercase font-medium">Sharpe Ratio</span>
          <p className="text-lg font-bold font-mono text-foreground mt-1">
            {risk?.sharpeRatio?.toFixed(2) ?? '—'}
          </p>
          <span className="text-[10px] text-muted-foreground">Risk-free hurdle: 4.5%</span>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] text-muted-foreground uppercase font-medium">Max Drawdown</span>
          <p className="text-lg font-bold font-mono text-loss mt-1">
            {risk?.maxDrawdown ? `-${(risk.maxDrawdown * 100).toFixed(2)}%` : '—'}
          </p>
          <span className="text-[10px] text-muted-foreground">Historical peak-to-trough</span>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] text-muted-foreground uppercase font-medium">Historical VaR (95%)</span>
          <p className="text-lg font-bold font-mono text-foreground mt-1">
            {risk?.var95Historical ? `-${(risk.var95Historical * 100).toFixed(2)}%` : '—'}
          </p>
          <span className="text-[10px] text-muted-foreground">Daily 95% tail risk</span>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
            {STRINGS.portfolio.holdingsTable} ({positions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingPortfolio ? (
            <div className="p-4 space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : positions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead className="text-right">Shares</TableHead>
                  <TableHead className="text-right">Avg Cost</TableHead>
                  <TableHead className="text-right">Current Price</TableHead>
                  <TableHead className="text-right">Market Value</TableHead>
                  <TableHead className="text-right">Gain / Loss</TableHead>
                  <TableHead className="text-right">Allocation</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((pos) => (
                  <TableRow key={pos.id}>
                    <TableCell className="font-semibold text-foreground">
                      <Link href={`/symbol/${pos.symbol}`} className="hover:underline">
                        {pos.symbol}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {pos.sector}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {pos.shares}
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {formatCurrency(pos.averageCost)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(pos.currentPrice)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-foreground">
                      {formatCurrency(pos.marketValue)}
                    </TableCell>
                    <TableCell className="text-right">
                      <GainLossBadge value={pos.unrealizedGainPercent} />
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {pos.weightPercent.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={() => deletePositionMutation.mutate(pos.id)}
                        className="text-muted-foreground hover:text-loss transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground">
              {STRINGS.portfolio.emptyPositions}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sector Exposures & Stress Test Drawdown Scenarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Exposures */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              {STRINGS.portfolio.sectorExposures}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sector</TableHead>
                  <TableHead className="text-right">Capital Value</TableHead>
                  <TableHead className="text-right">Weight</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(risk?.sectorExposures ?? []).map((sec) => (
                  <TableRow key={sec.sector}>
                    <TableCell className="font-medium text-foreground">{sec.sector}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {formatCurrency(sec.value)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-foreground">
                      {sec.weightPercent.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Drawdown Stress Test Scenarios */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{STRINGS.portfolio.drawdownScenarios}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scenario</TableHead>
                  <TableHead className="text-right">Shock %</TableHead>
                  <TableHead className="text-right">Est. Portfolio Impact</TableHead>
                  <TableHead className="text-right">Loss Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(risk?.drawdownScenarios ?? []).map((scen, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <span className="font-medium text-foreground block">{scen.name}</span>
                      <span className="text-[10px] text-muted-foreground block">{scen.description}</span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {scen.marketShockPercent}%
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono font-medium text-loss">
                        {scen.estimatedPortfolioImpactPercent}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-loss">
                      -${scen.estimatedPortfolioLossValue.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Regulatory Informational Disclaimer */}
      <div className="p-3 border border-border/60 rounded-md bg-muted/20 text-[11px] text-muted-foreground leading-relaxed">
        {STRINGS.common.regulatoryDisclaimer}
      </div>
    </div>
  );
}
