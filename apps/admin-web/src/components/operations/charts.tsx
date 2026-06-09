"use client";

import { useId } from "react";

// ── Sparkline ─────────────────────────────────────────────────────────

interface SparklineProps {
  values: number[];
  color?: string;
  fillColor?: string;
  height?: number;
  width?: number;
  className?: string;
}

export function Sparkline({
  className = "",
  color = "#2563eb",
  fillColor,
  height = 40,
  values,
  width = 120,
}: SparklineProps) {
  const gradientId = useId();

  if (values.length < 2) {
    return null;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`)
    .join(" ");

  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <svg
      className={className}
      height={height}
      preserveAspectRatio="none"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
    >
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={gradientId}
          x1="0"
          x2="0"
          y1="0"
          y2={height}
        >
          <stop offset="0%" stopColor={fillColor ?? color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={fillColor ?? color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

// ── Donut ─────────────────────────────────────────────────────────────

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerValue?: string | number;
  centerLabel?: string;
}

/** Clean SVG donut chart for share-of-total visualisations. */
export function DonutChart({
  centerLabel,
  centerValue,
  segments,
  size = 160,
  thickness = 16,
}: DonutChartProps) {
  const radius = size / 2 - thickness / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  let cumulative = 0;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg height={size} viewBox={`0 0 ${size} ${size}`} width={size}>
        <circle
          cx={center}
          cy={center}
          fill="none"
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={thickness}
        />
        {segments.map((segment) => {
          const dash = (segment.value / total) * circumference;
          const gap = circumference - dash;
          const offset = -cumulative;
          cumulative += dash;

          return (
            <circle
              cx={center}
              cy={center}
              fill="none"
              key={segment.label}
              r={radius}
              stroke={segment.color}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={offset}
              strokeLinecap="butt"
              strokeWidth={thickness}
              transform={`rotate(-90 ${center} ${center})`}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {centerValue !== undefined ? (
          <span className="text-3xl font-semibold tabular-nums text-slate-900">
            {centerValue}
          </span>
        ) : null}
        {centerLabel ? (
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {centerLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}

// ── Bar chart ─────────────────────────────────────────────────────────

interface BarChartProps {
  data: Array<{ label: string; value: number; tone?: string }>;
  max?: number;
  className?: string;
  showValues?: boolean;
}

/** Compact horizontal bar chart for breakdowns inside a card. */
export function BarChart({
  className = "",
  data,
  max,
  showValues = true,
}: BarChartProps) {
  const ceiling = max ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {data.map((item) => {
        const widthPct = Math.max(4, (item.value / ceiling) * 100);
        return (
          <div className="flex items-center gap-3" key={item.label}>
            <span className="w-24 shrink-0 truncate text-xs font-medium text-slate-600">
              {item.label}
            </span>
            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: item.tone ?? "#2563eb",
                  width: `${widthPct}%`,
                }}
              />
            </div>
            {showValues ? (
              <span className="w-10 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-900">
                {item.value}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
