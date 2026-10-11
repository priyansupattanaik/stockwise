'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useSettingsStore } from '../../stores/use-settings-store';
import { STRINGS } from '../../content/strings';
import { Settings as SettingsIcon, Sun, Moon, Database, Cpu, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const {
    theme,
    toggleTheme,
    sessionTokensUsed,
    sessionCostUsd,
    resetTokenBudget,
    showDelayedBadge,
    setShowDelayedBadge,
  } = useSettingsStore();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="pb-4 border-b border-border">
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-foreground" />
          <span>{STRINGS.settings.title}</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {STRINGS.settings.subtitle}
        </p>
      </div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Appearance & Theme Tokens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Zinc Neutral Theme
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Strict restrained palette with colorblind-safe gain/loss tokens. No gradients or purple.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={toggleTheme} className="gap-2 text-xs">
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5" />
                    <span>Switch to Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5" />
                    <span>Switch to Dark</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Provider Configuration */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Database className="w-3.5 h-3.5" />
              <span>Market Data Provider</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-foreground block">Active Provider</span>
                <span className="text-muted-foreground block text-[11px]">
                  US Equities deterministic provider with graceful fallback.
                </span>
              </div>
              <Badge variant="outline" className="font-mono">
                mock-us-equities
              </Badge>
            </div>
            <div className="pt-2 border-t border-border/60 flex items-center justify-between">
              <div>
                <span className="font-semibold text-foreground block">Delayed Quote Indicator</span>
                <span className="text-muted-foreground block text-[11px]">
                  Show 15-minute delayed quote notice on ticker headers.
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDelayedBadge(!showDelayedBadge)}
              >
                {showDelayedBadge ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Metering & Budgeting */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>Token Usage & Cost Meter</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded border border-border bg-muted/20">
                <span className="text-[11px] text-muted-foreground uppercase block">
                  Session Tokens Metered
                </span>
                <span className="text-lg font-bold font-mono tabular-nums text-foreground mt-1 block">
                  {sessionTokensUsed.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded border border-border bg-muted/20">
                <span className="text-[11px] text-muted-foreground uppercase block">
                  Estimated Inference Cost
                </span>
                <span className="text-lg font-bold font-mono tabular-nums text-foreground mt-1 block">
                  ${sessionCostUsd.toFixed(5)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <p className="text-[11px] text-muted-foreground">
                All inference queries are strictly cached and metered per prompt version.
              </p>
              <Button variant="ghost" size="sm" onClick={resetTokenBudget} className="gap-1.5 text-xs">
                <RefreshCw className="w-3 h-3" />
                <span>{STRINGS.settings.resetBudget}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Regulatory & Notice Box */}
        <div className="p-4 rounded-md border border-border bg-muted/10 text-xs text-muted-foreground leading-relaxed">
          {STRINGS.common.regulatoryDisclaimer}
        </div>
      </div>
    </div>
  );
}
