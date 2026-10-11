'use client';

import React, { useState, useMemo } from 'react';
import type { OHLCV } from '@stockan/shared';
import { calculateSMA } from '@stockan/analytics';
import { formatCurrency, formatNumber, formatDate } from '../../lib/formatters';

interface CandlestickChartProps {
  data: OHLCV[];
  height?: number;
}

export function CandlestickChart({ data, height = 380 }: CandlestickChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const closes = useMemo(() => data.map((d) => d.close), [data]);
  const sma20 = useMemo(() => calculateSMA(closes, 20), [closes]);
  const sma50 = useMemo(() => calculateSMA(closes, 50), [closes]);

  if (!data || data.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center border border-border rounded-lg bg-card text-muted-foreground text-xs"
      >
        No historical price bars available
      </div>
    );
  }

  const width = 800;
  const padding = { top: 20, right: 60, bottom: 40, left: 10 };
  const chartHeight = height - padding.top - padding.bottom;
  const priceChartHeight = chartHeight * 0.75;
  const volumeChartHeight = chartHeight * 0.22;
  const volumeTop = padding.top + priceChartHeight + chartHeight * 0.03;

  const minPrice = Math.min(...data.map((d) => d.low)) * 0.99;
  const maxPrice = Math.max(...data.map((d) => d.high)) * 1.01;
  const priceRange = maxPrice - minPrice || 1;

  const maxVolume = Math.max(...data.map((d) => d.volume)) || 1;

  const getX = (index: number) => {
    const usableWidth = width - padding.left - padding.right;
    return padding.left + (index / (data.length - 1 || 1)) * usableWidth;
  };

  const getY = (price: number) => {
    return padding.top + priceChartHeight - ((price - minPrice) / priceRange) * priceChartHeight;
  };

  const getVolY = (vol: number) => {
    const h = (vol / maxVolume) * volumeChartHeight;
    return volumeTop + volumeChartHeight - h;
  };

  const candleWidth = Math.max(2, Math.min(8, (width - padding.left - padding.right) / data.length - 2));

  // Generate SVG path for SMAs
  const buildSmaPath = (series: (number | null)[]) => {
    let path = '';
    series.forEach((val, i) => {
      if (val === null) return;
      const x = getX(i);
      const y = getY(val);
      if (!path) path += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      else path += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    });
    return path;
  };

  const sma20Path = useMemo(() => buildSmaPath(sma20), [sma20, data]);
  const sma50Path = useMemo(() => buildSmaPath(sma50), [sma50, data]);

  const activeBar = hoverIndex !== null ? data[hoverIndex] : data[data.length - 1];

  return (
    <div className="relative border border-border rounded-lg bg-card p-3 select-none">
      {/* Legend & Hover Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border/60 text-xs">
        <div className="flex items-center gap-4">
          <span className="font-medium text-foreground">{formatDate(activeBar?.timestamp)}</span>
          <span className="text-muted-foreground">
            O: <span className="text-foreground tabular-nums font-mono">{activeBar?.open.toFixed(2)}</span>
          </span>
          <span className="text-muted-foreground">
            H: <span className="text-foreground tabular-nums font-mono">{activeBar?.high.toFixed(2)}</span>
          </span>
          <span className="text-muted-foreground">
            L: <span className="text-foreground tabular-nums font-mono">{activeBar?.low.toFixed(2)}</span>
          </span>
          <span className="text-muted-foreground">
            C: <span className="text-foreground tabular-nums font-mono">{activeBar?.close.toFixed(2)}</span>
          </span>
          <span className="text-muted-foreground">
            Vol: <span className="text-foreground tabular-nums font-mono">{formatNumber(activeBar?.volume, true)}</span>
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2.5 h-0.5 bg-foreground inline-block" /> SMA 20
          </span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2.5 h-0.5 bg-muted-foreground/60 inline-block" /> SMA 50
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto cursor-crosshair pt-2"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const svgX = ((e.clientX - rect.left) / rect.width) * width;
          const usableWidth = width - padding.left - padding.right;
          const ratio = Math.max(0, Math.min(1, (svgX - padding.left) / usableWidth));
          const idx = Math.round(ratio * (data.length - 1));
          setHoverIndex(idx);
        }}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const price = minPrice + pct * priceRange;
          const y = getY(price);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="hsl(var(--border))"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x={width - padding.right + 6}
                y={y + 3}
                fill="hsl(var(--muted-foreground))"
                fontSize="10"
                fontFamily="var(--font-mono)"
              >
                ${price.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* Volume Bars */}
        {data.map((d, i) => {
          const x = getX(i);
          const y = getVolY(d.volume);
          const barH = volumeTop + volumeChartHeight - y;
          const isUp = d.close >= d.open;
          return (
            <rect
              key={`vol-${i}`}
              x={x - candleWidth / 2}
              y={y}
              width={candleWidth}
              height={Math.max(1, barH)}
              fill={isUp ? 'hsl(var(--gain))' : 'hsl(var(--loss))'}
              opacity={0.3}
            />
          );
        })}

        {/* Candlestick Wicks and Bodies */}
        {data.map((d, i) => {
          const x = getX(i);
          const isUp = d.close >= d.open;
          const highY = getY(d.high);
          const lowY = getY(d.low);
          const openY = getY(d.open);
          const closeY = getY(d.close);
          const bodyY = Math.min(openY, closeY);
          const bodyH = Math.max(1, Math.abs(openY - closeY));
          const color = isUp ? 'hsl(var(--gain))' : 'hsl(var(--loss))';

          return (
            <g key={`bar-${i}`}>
              {/* Wick */}
              <line
                x1={x}
                y1={highY}
                x2={x}
                y2={lowY}
                stroke={color}
                strokeWidth="1"
              />
              {/* Candle Body */}
              <rect
                x={x - candleWidth / 2}
                y={bodyY}
                width={candleWidth}
                height={bodyH}
                fill={isUp ? color : color}
              />
            </g>
          );
        })}

        {/* Moving Averages */}
        {sma20Path && (
          <path d={sma20Path} fill="none" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
        )}
        {sma50Path && (
          <path
            d={sma50Path}
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="1.2"
            strokeDasharray="4 2"
          />
        )}

        {/* Hover Crosshair */}
        {hoverIndex !== null && (
          <g>
            <line
              x1={getX(hoverIndex)}
              y1={padding.top}
              x2={getX(hoverIndex)}
              y2={padding.top + chartHeight}
              stroke="hsl(var(--foreground))"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          </g>
        )}
      </svg>
    </div>
  );
}
