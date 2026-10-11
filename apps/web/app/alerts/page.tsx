'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { formatDate } from '../../lib/formatters';
import { STRINGS } from '../../content/strings';
import { Bell, Plus, Trash2, CheckCircle2 } from 'lucide-react';

const ALERT_TYPES = [
  { value: 'PRICE_ABOVE', label: 'Price Crosses Above' },
  { value: 'PRICE_BELOW', label: 'Price Drops Below' },
  { value: 'VOLUME_SPIKE', label: 'Volume Spike' },
  { value: 'RSI_OVERBOUGHT', label: 'RSI Crosses Overbought (>70)' },
  { value: 'RSI_OVERSOLD', label: 'RSI Crosses Oversold (<30)' },
];

export default function AlertsPage() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [type, setType] = useState('PRICE_ABOVE');
  const [threshold, setThreshold] = useState('');

  const { data: rules, isLoading: loadingRules } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.getAlerts(),
  });

  const { data: notifications, isLoading: loadingNotifications } = useQuery({
    queryKey: ['alert-notifications'],
    queryFn: () => api.getAlertNotifications(),
  });

  const createAlertMutation = useMutation({
    mutationFn: (data: { symbol: string; type: string; threshold: number }) =>
      api.createAlert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setSymbol('');
      setThreshold('');
      setShowAddForm(false);
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !threshold) return;
    createAlertMutation.mutate({
      symbol: symbol.trim().toUpperCase(),
      type,
      threshold: Number(threshold),
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {STRINGS.alerts.title}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {STRINGS.alerts.subtitle}
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="gap-1.5 text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{STRINGS.alerts.createAlert}</span>
        </Button>
      </div>

      {/* Add Alert Form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="p-4 bg-muted/40 border border-border rounded-lg flex flex-wrap items-center gap-3">
          <Input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Ticker (e.g. MSFT)"
            className="w-32 uppercase text-xs h-8"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {ALERT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <Input
            type="number"
            step="any"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            placeholder="Threshold"
            className="w-32 text-xs h-8"
          />

          <Button type="submit" size="sm" disabled={createAlertMutation.isPending}>
            Save Rule
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

      {/* Active Rules and Trigger Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Rules */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Bell className="w-3.5 h-3.5" />
              <span>{STRINGS.alerts.activeRules} ({rules?.length ?? 0})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingRules ? (
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : rules && rules.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Trigger Type</TableHead>
                    <TableHead className="text-right">Threshold</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-semibold text-foreground">
                        {rule.symbol}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs font-mono">
                        {rule.type}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium text-foreground">
                        {rule.threshold}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="text-gain border-gain/40">
                          Active
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-xs text-muted-foreground p-6 text-center">
                {STRINGS.alerts.emptyRules}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Trigger Notifications Log */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{STRINGS.alerts.historyLog}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingNotifications ? (
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : notifications && notifications.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Event Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notif) => (
                    <TableRow key={notif.id}>
                      <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {formatDate(notif.timestamp)}
                      </TableCell>
                      <TableCell className="text-xs text-foreground">
                        {notif.message}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-xs text-muted-foreground p-6 text-center">
                {STRINGS.alerts.emptyNotifications}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
