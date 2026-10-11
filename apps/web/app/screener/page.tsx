'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { DataTable } from '../../components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { GainLossBadge } from '../../components/ui/gain-loss-badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Skeleton } from '../../components/ui/skeleton';
import { Badge } from '../../components/ui/badge';
import { formatCurrency, formatPercent, formatNumber } from '../../lib/formatters';
import { STRINGS } from '../../content/strings';
import { Filter, Plus, Trash2, Download, RefreshCw } from 'lucide-react';
import type { ScreenerCriterion, ScreenerMetricField, FilterOperator, ScreenerResultRow } from '@stockwise/shared';

const AVAILABLE_FIELDS: { label: string; value: ScreenerMetricField }[] = [
  { label: 'Sector', value: 'sector' },
  { label: 'Market Cap', value: 'marketCap' },
  { label: 'P/E (TTM)', value: 'peRatioTTM' },
  { label: 'Price', value: 'price' },
  { label: 'Dividend Yield', value: 'dividendYield' },
  { label: 'Return on Equity', value: 'returnOnEquity' },
  { label: 'Beta', value: 'beta' },
];

export default function ScreenerPage() {
  const [criteria, setCriteria] = useState<ScreenerCriterion[]>([
    { field: 'marketCap', operator: 'gte', value: 100000000000 },
  ]);
  const [sortBy, setSortBy] = useState<ScreenerMetricField>('marketCap');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // New criterion state
  const [newField, setNewField] = useState<ScreenerMetricField>('peRatioTTM');
  const [newOperator, setNewOperator] = useState<FilterOperator>('lt');
  const [newValue, setNewValue] = useState<string>('30');

  const { data: presets } = useQuery({
    queryKey: ['screener-presets'],
    queryFn: () => api.getScreenerPresets(),
  });

  const { data: result, isLoading, refetch } = useQuery({
    queryKey: ['screener-run', criteria, sortBy, sortDirection],
    queryFn: () =>
      api.runScreener({
        criteria,
        sortBy,
        sortDirection,
        limit: 50,
        offset: 0,
      }),
  });

  const handleAddCriterion = () => {
    let parsedVal: any = Number(newValue);
    if (isNaN(parsedVal) || newField === 'sector') {
      parsedVal = newValue;
    }
    setCriteria([...criteria, { field: newField, operator: newOperator, value: parsedVal }]);
  };

  const handleRemoveCriterion = (idx: number) => {
    setCriteria(criteria.filter((_, i) => i !== idx));
  };

  const handleApplyPreset = (query: any) => {
    setCriteria(query.criteria);
    setSortBy(query.sortBy);
    setSortDirection(query.sortDirection);
  };

  const handleSort = (field: ScreenerMetricField) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const handleExportCsv = () => {
    if (!result?.items || result.items.length === 0) return;
    const headers = ['Symbol,Company,Sector,Price,ChangePct,MarketCap,PE,Yield,Beta'];
    const rows = result.items.map(
      (i) =>
        `"${i.symbol}","${i.companyName}","${i.sector}",${i.price},${i.changePercent},${i.marketCap},${i.peRatioTTM ?? ''},${i.dividendYield ?? ''},${i.beta ?? ''}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stockwise-screen-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const rows = result?.items ?? [];

  const screenerColumns: ColumnDef<ScreenerResultRow>[] = [
    {
      accessorKey: 'symbol',
      header: 'Symbol',
      cell: ({ row }) => (
        <div>
          <Link href={`/symbol/${row.original.symbol}`} className="font-semibold text-foreground hover:underline">
            {row.original.symbol}
          </Link>
          <span className="text-[11px] text-muted-foreground ml-2 font-normal">
            {row.original.companyName}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'sector',
      header: 'Sector',
      cell: ({ row }) => <span className="text-muted-foreground text-[11px]">{row.original.sector}</span>,
    },
    {
      accessorKey: 'price',
      header: () => <div className="text-right">Price</div>,
      cell: ({ row }) => (
        <div className="text-right font-mono font-medium">{formatCurrency(row.original.price)}</div>
      ),
    },
    {
      accessorKey: 'changePercent',
      header: () => <div className="text-right">Change %</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <GainLossBadge value={row.original.changePercent} />
        </div>
      ),
    },
    {
      accessorKey: 'marketCap',
      header: () => <div className="text-right">Market Cap</div>,
      cell: ({ row }) => (
        <div className="text-right font-mono text-muted-foreground">
          {formatCurrency(row.original.marketCap, true)}
        </div>
      ),
    },
    {
      accessorKey: 'peRatioTTM',
      header: () => <div className="text-right">P/E (TTM)</div>,
      cell: ({ row }) => (
        <div className="text-right font-mono text-muted-foreground">
          {row.original.peRatioTTM ? `${row.original.peRatioTTM}x` : '—'}
        </div>
      ),
    },
    {
      accessorKey: 'dividendYield',
      header: () => <div className="text-right">Dividend Yield</div>,
      cell: ({ row }) => (
        <div className="text-right font-mono text-muted-foreground">
          {row.original.dividendYield ? `${row.original.dividendYield}%` : '0.00%'}
        </div>
      ),
    },
    {
      accessorKey: 'returnOnEquity',
      header: () => <div className="text-right">ROE</div>,
      cell: ({ row }) => (
        <div className="text-right font-mono text-muted-foreground">
          {row.original.returnOnEquity ? `${row.original.returnOnEquity}%` : '—'}
        </div>
      ),
    },
    {
      accessorKey: 'beta',
      header: () => <div className="text-right">Beta</div>,
      cell: ({ row }) => (
        <div className="text-right font-mono text-muted-foreground">
          {row.original.beta ? row.original.beta.toFixed(2) : '—'}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title & Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {STRINGS.screener.title}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {STRINGS.screener.subtitle}
          </p>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium mr-1">Presets:</span>
          {(presets ?? []).map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              size="sm"
              onClick={() => handleApplyPreset(preset.query)}
              className="text-xs"
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Filter Builder Card */}
      <Card>
        <CardHeader className="py-3 flex flex-row items-center justify-between">
          <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Active Filter Criteria ({criteria.length})</span>
          </CardTitle>
          {criteria.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setCriteria([])} className="text-xs text-muted-foreground">
              {STRINGS.screener.clearFilters}
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {/* List of active criteria badges */}
          <div className="flex flex-wrap items-center gap-2">
            {criteria.map((crit, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-secondary text-secondary-foreground text-xs font-mono border border-border"
              >
                <span>
                  {crit.field} {crit.operator} {String(crit.value)}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveCriterion(idx)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add Criterion Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/60">
            <select
              value={newField}
              onChange={(e) => setNewField(e.target.value as ScreenerMetricField)}
              className="h-8 rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {AVAILABLE_FIELDS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>

            <select
              value={newOperator}
              onChange={(e) => setNewOperator(e.target.value as FilterOperator)}
              className="h-8 rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono"
            >
              <option value="eq">=</option>
              <option value="gt">&gt;</option>
              <option value="gte">&gt;=</option>
              <option value="lt">&lt;</option>
              <option value="lte">&lt;=</option>
            </select>

            <Input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Value..."
              className="w-40 h-8 text-xs"
            />

            <Button variant="secondary" size="sm" onClick={handleAddCriterion} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>{STRINGS.screener.addCriterion}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Table Card */}
      <Card>
        <CardHeader className="py-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Screening Results ({result?.totalCount ?? 0})
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" />
              <span>{STRINGS.common.exportCsv}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-7 w-full" />
            </div>
          ) : (
            <DataTable
              columns={screenerColumns}
              data={rows}
              emptyMessage={STRINGS.screener.emptyState}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
