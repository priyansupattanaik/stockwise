'use client';

import React from 'react';
import { cn } from '../../lib/utils';

interface MiniSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  isPositive?: boolean;
  className?: string;
}

export function MiniSparkline({
  data,
  width = 100,
  height = 28,
  isPositive,
  className,
}: MiniSparklineProps) {
  if (!data || data.length < 2) {
    return <div style={{ width, height }} className="bg-muted/30 rounded" />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const positiveTrend =
    isPositive !== undefined ? isPositive : (data[data.length - 1] ?? 0) >= (data[0] ?? 0);

  const strokeColor = positiveTrend ? 'hsl(var(--gain))' : 'hsl(var(--loss))';

  return (
    <svg
      width={width}
      height={height}
      className={cn('overflow-visible shrink-0', className)}
    >
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
