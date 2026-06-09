import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Sparkline } from "@/components/operations/charts";

interface StatCardProps {
  /** Optional accent colour. Defaults to brand blue. */
  accent?: string;
  icon: LucideIcon;
  label: string;
  trend?: {
    direction: "up" | "down" | "flat";
    label: string;
  };
  sparkline?: number[];
  value: string | number;
}

const TREND_COLORS = {
  down: "#ef4444",
  flat: "#94a3b8",
  up: "#16a34a",
} as const;

const TREND_ICONS = {
  down: ArrowDownRight,
  flat: Minus,
  up: ArrowUpRight,
} as const;

/** Clean statistics card with a blue accent chip, value, and tiny trendline. */
export function StatCard({
  accent = "#2563eb",
  icon: Icon,
  label,
  sparkline,
  trend,
  value,
}: StatCardProps) {
  const TrendIcon = trend ? TREND_ICONS[trend.direction] : null;
  const trendColor = trend ? TREND_COLORS[trend.direction] : undefined;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-slate-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            {label}
          </p>
          <p className="text-3xl font-semibold tabular-nums text-slate-900">
            {value}
          </p>
        </div>
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
          style={{
            background: `${accent}14`,
            color: accent,
          }}
        >
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        {trend ? (
          <div className="flex items-center gap-1.5">
            {TrendIcon !== null ? (
              <TrendIcon
                size={14}
                style={{ color: trendColor }}
                strokeWidth={2.5}
              />
            ) : null}
            <span
              className="text-xs font-semibold"
              style={{ color: trendColor }}
            >
              {trend.label}
            </span>
          </div>
        ) : (
          <span />
        )}
        {sparkline !== undefined && sparkline.length > 1 ? (
          <Sparkline color={accent} height={28} values={sparkline} width={80} />
        ) : null}
      </div>
    </article>
  );
}
