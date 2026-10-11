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
import { formatCurrency, formatNumber } from '../../lib/formatters';
import { STRINGS } from '../../content/strings';
import { Bookmark, Plus, Trash2 } from 'lucide-react';

export default function WatchlistsPage() {
  const queryClient = useQueryClient();
  const [selectedListId, setSelectedListId] = useState<string>('wl-default');
  const [newSymbol, setNewSymbol] = useState<string>('');
  const [newListName, setNewListName] = useState<string>('');
  const [showCreateList, setShowCreateList] = useState<boolean>(false);

  const { data: watchlists, isLoading } = useQuery({
    queryKey: ['watchlists'],
    queryFn: () => api.getWatchlists(),
  });

  const addSymbolMutation = useMutation({
    mutationFn: ({ listId, symbol }: { listId: string; symbol: string }) =>
      api.addWatchlistItem(listId, symbol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      setNewSymbol('');
    },
  });

  const removeSymbolMutation = useMutation({
    mutationFn: ({ listId, symbol }: { listId: string; symbol: string }) =>
      api.removeWatchlistItem(listId, symbol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
    },
  });

  const createListMutation = useMutation({
    mutationFn: (name: string) => api.createWatchlist({ name }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      setSelectedListId(created.id);
      setNewListName('');
      setShowCreateList(false);
    },
  });

  const activeWatchlist =
    watchlists?.find((w) => w.id === selectedListId) ?? watchlists?.[0];

  const handleAddSymbol = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol.trim() || !activeWatchlist) return;
    addSymbolMutation.mutate({
      listId: activeWatchlist.id,
      symbol: newSymbol.trim().toUpperCase(),
    });
  };

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    createListMutation.mutate(newListName.trim());
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {STRINGS.watchlists.title}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {STRINGS.watchlists.subtitle}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCreateList(!showCreateList)}
          className="gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{STRINGS.watchlists.createList}</span>
        </Button>
      </div>

      {/* New Watchlist Inline Input Form */}
      {showCreateList && (
        <form onSubmit={handleCreateList} className="flex items-center gap-3 p-3 bg-muted/40 border border-border rounded-lg">
          <Input
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder={STRINGS.watchlists.listNamePlaceholder}
            className="h-8 max-w-xs text-xs"
          />
          <Button type="submit" size="sm" disabled={createListMutation.isPending}>
            Save Watchlist
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowCreateList(false)}
          >
            Cancel
          </Button>
        </form>
      )}

      {/* Watchlist Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
        {(watchlists ?? []).map((wl) => (
          <button
            key={wl.id}
            onClick={() => setSelectedListId(wl.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeWatchlist?.id === wl.id
                ? 'bg-secondary text-foreground font-semibold border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {wl.name} ({wl.items.length})
          </button>
        ))}
      </div>

      {/* Active Watchlist Table */}
      <Card>
        <CardHeader className="py-3 flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">
              {activeWatchlist?.name ?? 'Watchlist'}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activeWatchlist?.description ?? 'Monitored equity symbols'}
            </p>
          </div>

          {/* Quick Add Symbol Input */}
          <form onSubmit={handleAddSymbol} className="flex items-center gap-2">
            <Input
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              placeholder={STRINGS.watchlists.addSymbolPlaceholder}
              className="h-8 w-44 uppercase text-xs"
            />
            <Button
              type="submit"
              size="sm"
              variant="secondary"
              disabled={addSymbolMutation.isPending}
            >
              Add
            </Button>
          </form>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : activeWatchlist && activeWatchlist.items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                  <TableHead className="text-right">P/E (TTM)</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeWatchlist.items.map((item) => (
                  <TableRow key={item.symbol}>
                    <TableCell className="font-semibold text-foreground">
                      <Link href={`/symbol/${item.symbol}`} className="hover:underline">
                        {item.symbol}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {item.quote?.companyName ?? item.symbol}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(item.quote?.price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <GainLossBadge value={item.quote?.changePercent} />
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {formatNumber(item.quote?.volume, true)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {item.quote?.peRatio ? `${item.quote.peRatio}x` : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={() =>
                          removeSymbolMutation.mutate({
                            listId: activeWatchlist.id,
                            symbol: item.symbol,
                          })
                        }
                        className="text-muted-foreground hover:text-loss transition-colors p-1"
                        aria-label="Remove symbol"
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
              {STRINGS.watchlists.emptyWatchlist}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
