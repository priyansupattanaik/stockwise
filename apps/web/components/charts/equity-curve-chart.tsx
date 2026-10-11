'use client';

import React, { useState } from 'react';
import { formatCurrency, formatPercent, formatDate } from '../../lib/formatters';

interface EquityPoint {
  date: string;
  equity: number;
  drawdownPercent: number;
}

interface EquityCurveChartProps {
  data: EquityPoint[];
  height?: number;
}

export function EquityCurveChart({ data, height = 300 }: EquityCurveChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center border border-border rounded-lg bg-card text-muted-foreground text-xs"
      >
        No equity curve points available
      </div>
    );
  }

  const width = 800;
  const padding = { top: 20, right: 65, bottom: 30, left: 10 };
  const chartHeight = height - padding.top - padding.bottom;
  const equityHeight = chartHeight * 0.7;
  const ddHeight = chartHeight * 0.25;
  const ddTop = padding.top + equityHeight + chartHeight * 0.05;

  const minEquity = Math.min(...data.map((d) => d.equity)) * 0.98;
  const maxEquity = Math.max(...data.map((d) => d.equity)) * 1.02;
  const equityRange = maxEquity - minEquity || 1;

  const maxDrawdown = Math.max(...data.map((d) => d.drawdownPercent), 5);

  const getX = (index: number) => {
    const usableWidth = width - padding.left - padding.right;
    return padding.left + (index / (data.length - 1 || 1)) * usableWidth;
  };

  const getY = (val: number) => {
    return padding.top + equityHeight - ((val - minEquity) / equityRange) * equityHeight;
  };

  const getDdY = (ddPct: number) => {
    return ddTop + (ddPct / maxDrawdown) * ddHeight;
  };

  const equityPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.equity).toFixed(1)}`)
    .join(' ');

  const ddPath =
    `M ${getX(0).toFixed(1)} ${ddTop.toFixed(1)} ` +
    data.map((d, i) => `L ${getX(i).toFixed(1)} ${getDdY(d.drawdownPercent).toFixed(1)}`).join(' ') +
    ` L ${getX(data.length - 1).toFixed(1)} ${ddTop.toFixed(1)} Z`;

  const activePoint = hoverIdx !== null ? data[hoverIdx] : data[data.length - 1];

  return (
    <div className="relative border border-border rounded-lg bg-card p-3 select-none">
      <div className="flex items-center justify-between pb-2 border-b border-border/60 text-xs">
        <div className="flex items-center gap-4">
          <span className="font-medium text-foreground">{formatDate(activePoint?.date)}</span>
          <span className="text-muted-foreground">
            Equity:{' '}
            <span className="text-foreground tabular-nums font-mono">
              {formatCurrency(activePoint?.equity)}
            </span>
          </span>
          <span className="text-muted-foreground">
            Drawdown:{' '}
            <span className="text-loss tabular-nums font-mono font-medium">
              -{activePoint?.drawdownPercent.toFixed(2)}%
            </span>
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
          setHoverIdx(idx);
        }}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {/* Equity grid lines */}
        {[0, 0.5, 1].map((pct, i) => {
          const val = minEquity + pct * equityRange;
          const y = getY(val);
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
                ${val.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Equity Curve Line */}
        <path d={equityPath} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.8" />

        {/* Underwater Drawdown Area */}
        <path d={ddPath} fill="hsl(var(--loss) / 0.18)" stroke="hsl(var(--loss))" strokeWidth="1" />

        {/* Drawdown Label */}
        <text
          x={width - padding.right + 6}
          y={ddTop + ddHeight}
          fill="hsl(var(--loss))"
          fontSize="10"
          fontFamily="var(--font-mono)"
        >
          -{maxDrawdown.toFixed(1)}%
        </text>

        {hoverIdx !== null && (
          <line
            x1={getX(hoverIdx)}
            y1={padding.top}
            x2={getX(hoverIdx)}
            y2={padding.top + chartHeight}
            stroke="hsl(var(--foreground))"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
        )}
      </svg>
    </div>
  );
}
