'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  LayoutDashboard,
  Filter,
  Bookmark,
  Briefcase,
  Bell,
  Cpu,
  Settings,
  Layers,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { STRINGS } from '../../content/strings';

const NAV_ITEMS = [
  { label: STRINGS.navigation.dashboard, href: '/', icon: LayoutDashboard },
  { label: STRINGS.navigation.screener, href: '/screener', icon: Filter },
  { label: STRINGS.navigation.watchlists, href: '/watchlists', icon: Bookmark },
  { label: STRINGS.navigation.portfolio, href: '/portfolio', icon: Briefcase },
  { label: STRINGS.navigation.alerts, href: '/alerts', icon: Bell },
  { label: STRINGS.navigation.research, href: '/research', icon: Cpu },
  { label: STRINGS.navigation.settings, href: '/settings', icon: Settings },
  { label: STRINGS.navigation.designSystem, href: '/design-system', icon: Layers },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-card flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="h-14 flex items-center px-4 border-b border-border gap-2">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-foreground">
            {STRINGS.common.appName}
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-secondary text-foreground font-semibold'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-foreground' : 'text-muted-foreground')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-border/60 text-[11px] text-muted-foreground">
        <p className="font-mono">{STRINGS.common.footer}</p>
        <p className="text-[10px] text-muted-foreground/80 mt-0.5">{STRINGS.common.footerSubtitle}</p>
      </div>
    </aside>
  );
}
