import * as React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface GainLossBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number | null | undefined;
  percentage?: boolean;
  showIcon?: boolean;
}

export function GainLossBadge({
  value,
  percentage = true,
  showIcon = true,
  className,
  ...props
}: GainLossBadgeProps) {
  if (value === null || value === undefined) {
    return <span className={cn('text-muted-foreground text-xs tabular-nums', className)}>—</span>;
  }

  const isPositive = value > 0;
  const isNegative = value < 0;
  const isZero = value === 0;

  const formatted = percentage
    ? `${isPositive ? '+' : ''}${value.toFixed(2)}%`
    : `${isPositive ? '+' : ''}${value.toFixed(2)}`;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-mono text-xs tabular-nums font-medium px-1.5 py-0.5 rounded-sm',
        {
          'bg-gain/15 text-gain': isPositive,
          'bg-loss/15 text-loss': isNegative,
          'bg-neutral/15 text-muted-foreground': isZero,
        },
        className
      )}
      {...props}
    >
      {showIcon && (
        <>
          {isPositive && <ArrowUp className="w-3 h-3 text-gain" strokeWidth={2.5} />}
          {isNegative && <ArrowDown className="w-3 h-3 text-loss" strokeWidth={2.5} />}
          {isZero && <Minus className="w-3 h-3 text-muted-foreground" strokeWidth={2} />}
        </>
      )}
      <span>{formatted}</span>
    </span>
  );
}
