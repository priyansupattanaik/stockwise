'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sun, Moon, Clock, DollarSign } from 'lucide-react';
import { useSettingsStore } from '../../stores/use-settings-store';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { STRINGS } from '../../content/strings';

export function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, toggleTheme, sessionTokensUsed, sessionCostUsd } = useSettingsStore();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim().toUpperCase();
    if (trimmed) {
      router.push(`/symbol/${trimmed}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between gap-4 select-none">
      {/* Symbol Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative w-80">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search ticker (e.g. AAPL, NVDA, MSFT)..."
          className="pl-8 bg-muted/30 border-border/80 text-xs h-8"
        />
      </form>

      {/* Right Meta Controls */}
      <div className="flex items-center gap-3">
        {/* Delayed Quote Status Badge */}
        <Badge variant="outline" className="gap-1 text-[11px] font-normal text-muted-foreground py-1">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span>{STRINGS.symbolDetail.delayedBadge}</span>
        </Badge>

        {/* Token Cost Meter */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded border border-border bg-muted/20 text-[11px] font-mono tabular-nums text-muted-foreground">
          <span>{sessionTokensUsed.toLocaleString()} tokens</span>
          <span className="text-muted-foreground/40">|</span>
          <span className="text-foreground">${sessionCostUsd.toFixed(4)}</span>
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle Color Theme"
          className="w-8 h-8 rounded-md"
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </Button>
      </div>
    </header>
  );
}
