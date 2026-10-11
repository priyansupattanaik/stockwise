'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { GainLossBadge } from '../../components/ui/gain-loss-badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/table';
import { MiniSparkline } from '../../components/charts/mini-sparkline';
import { Layers } from 'lucide-react';

export default function DesignSystemPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="pb-4 border-b border-border">
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Layers className="w-5 h-5 text-foreground" />
          <span>Design System Tokens & Base Primitives</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Restrained, institutional palette: Zinc neutral, hairline borders, tabular numerals, colorblind-safe gain/loss tokens.
        </p>
      </div>

      {/* 1. Color Tokens Grid */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          1. Color Palette Tokens
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 border border-border rounded-md bg-card">
            <div className="h-10 rounded bg-background border border-border mb-2" />
            <span className="text-xs font-semibold text-foreground block">Background</span>
            <span className="text-[10px] font-mono text-muted-foreground">hsl(var(--background))</span>
          </div>
          <div className="p-3 border border-border rounded-md bg-card">
            <div className="h-10 rounded bg-foreground mb-2" />
            <span className="text-xs font-semibold text-foreground block">Foreground</span>
            <span className="text-[10px] font-mono text-muted-foreground">hsl(var(--foreground))</span>
          </div>
          <div className="p-3 border border-border rounded-md bg-card">
            <div className="h-10 rounded bg-muted border border-border mb-2" />
            <span className="text-xs font-semibold text-foreground block">Muted & Borders</span>
            <span className="text-[10px] font-mono text-muted-foreground">hsl(var(--muted))</span>
          </div>
          <div className="p-3 border border-border rounded-md bg-card">
            <div className="h-10 rounded bg-secondary mb-2" />
            <span className="text-xs font-semibold text-foreground block">Secondary Surface</span>
            <span className="text-[10px] font-mono text-muted-foreground">hsl(var(--secondary))</span>
          </div>
        </div>
      </section>

      {/* 2. Colorblind-Safe Gain / Loss Tokens */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          2. Colorblind-Safe Financial Tokens (Paired with Icons and Signs)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 border border-border rounded-md bg-card space-y-2">
            <span className="text-xs font-semibold text-foreground block">Positive Gain Token</span>
            <p className="text-[11px] text-muted-foreground">
              Teal / Emerald palette compliant with Deuteranopia & Protanopia:
            </p>
            <div className="flex items-center gap-2 pt-1">
              <GainLossBadge value={4.25} />
              <GainLossBadge value={0.85} />
            </div>
          </div>
          <div className="p-4 border border-border rounded-md bg-card space-y-2">
            <span className="text-xs font-semibold text-foreground block">Negative Loss Token</span>
            <p className="text-[11px] text-muted-foreground">
              Crimson / Rose palette with distinct luminance and down arrow:
            </p>
            <div className="flex items-center gap-2 pt-1">
              <GainLossBadge value={-2.75} />
              <GainLossBadge value={-0.42} />
            </div>
          </div>
          <div className="p-4 border border-border rounded-md bg-card space-y-2">
            <span className="text-xs font-semibold text-foreground block">Unchanged / Flat</span>
            <p className="text-[11px] text-muted-foreground">
              Neutral slate token with horizontal minus sign:
            </p>
            <div className="flex items-center gap-2 pt-1">
              <GainLossBadge value={0.0} />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Typography & Tabular Numerals */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          3. Typography & Tabular Figures
        </h2>
        <Card className="p-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Strict type pair: System Sans for interface text and monospace/tabular figures for numbers, guaranteeing vertical column alignment:
          </p>
          <div className="font-mono text-sm space-y-1 p-3 bg-muted/40 rounded border border-border">
            <div className="flex justify-between w-64 tabular-nums">
              <span>AAPL Session Open:</span>
              <span>$230.10</span>
            </div>
            <div className="flex justify-between w-64 tabular-nums">
              <span>MSFT Session Open:</span>
              <span>$420.00</span>
            </div>
            <div className="flex justify-between w-64 tabular-nums">
              <span>NVDA Session Open:</span>
              <span>$134.10</span>
            </div>
          </div>
        </Card>
      </section>

      {/* 4. Base UI Components */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          4. Base Component Primitives
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 space-y-3">
            <span className="text-xs font-semibold text-foreground block">Buttons & Inputs</span>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm">Primary</Button>
              <Button size="sm" variant="secondary">Secondary</Button>
              <Button size="sm" variant="outline">Outline</Button>
              <Button size="sm" variant="ghost">Ghost</Button>
            </div>
            <div className="pt-2">
              <Input placeholder="Input element with tabular-nums..." className="h-8 max-w-sm" />
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <span className="text-xs font-semibold text-foreground block">Skeletons (No Spinners Rule)</span>
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-full" />
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
