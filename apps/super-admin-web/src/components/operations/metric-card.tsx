import type { LucideIcon } from "lucide-react";
import type { Tone } from "@/lib/operations-data";

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
  return (
    <article className="rounded-lg border border-[var(--color-operations-border)] bg-[var(--color-operations-panel)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-300">{label}</p>
          <p
            className="mt-2 text-4xl font-semibold tabular-nums"
            style={{ color: `var(--color-${tone})` }}
          >
            {value}
          </p>
        </div>
        {Icon ? (
          <div
            className="grid h-11 w-11 place-items-center rounded-md bg-[#061927]"
            style={{ color: `var(--color-${tone})` }}
          >
            <Icon aria-hidden size={22} strokeWidth={2} />
          </div>
        ) : null}
      </div>
      {trend ? <p className="mt-3 text-xs font-semibold text-slate-400">{trend}</p> : null}
    </article>
  );
}
