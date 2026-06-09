import type { LucideIcon } from "lucide-react";
import type { Tone } from "@/lib/operations-data";

const TONE_COLOR: Record<Tone, string> = {
  brand: "#2563eb",
  emergency: "#ef4444",
  muted: "#64748b",
  safety: "#16a34a",
  warning: "#f59e0b",
};

export function MetricCard({
  icon: Icon,
  label,
  tone,
  trend,
  value,
}: {
  icon?: LucideIcon;
  label: string;
  tone: Tone;
  trend?: string;
  value: string;
}) {
  const accent = TONE_COLOR[tone];

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-slate-300">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            {label}
          </p>
          <p
            className="mt-2 text-3xl font-semibold tabular-nums"
            style={{ color: accent }}
          >
            {value}
          </p>
        </div>
        {Icon ? (
          <div
            className="grid h-11 w-11 place-items-center rounded-xl"
            style={{ background: `${accent}14`, color: accent }}
          >
            <Icon aria-hidden size={20} strokeWidth={2} />
          </div>
        ) : null}
      </div>
      {trend ? (
        <p className="mt-3 text-xs font-medium text-slate-500">{trend}</p>
      ) : null}
    </article>
  );
}
