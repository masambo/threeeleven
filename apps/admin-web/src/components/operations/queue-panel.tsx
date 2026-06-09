import type { LucideIcon } from "lucide-react";
import type { Tone } from "@/lib/operations-data";
import { StatusChip } from "./status-chip";

const TONE_COLOR: Record<Tone, string> = {
  brand: "#2563eb",
  emergency: "#ef4444",
  muted: "#64748b",
  safety: "#16a34a",
  warning: "#f59e0b",
};

export function QueuePanel({
  emptyMessage = "No priority items",
  isLoading = false,
  items,
  title = "Community Updates",
}: {
  emptyMessage?: string;
  isLoading?: boolean;
  items: Array<{
    title: string;
    meta: string;
    status: string;
    tone: Tone;
    icon: LucideIcon;
  }>;
  title?: string;
}) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <div className="mt-4 flex flex-col gap-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                className="flex w-full items-start gap-3 rounded-md bg-slate-50 p-3"
                key={`queue-loading-${index}`}
              >
                <span className="mt-0.5 h-8 w-8 shrink-0 animate-pulse rounded-md bg-slate-200" />
                <span className="min-w-0 flex-1">
                  <span className="block h-4 w-4/5 animate-pulse rounded bg-slate-200" />
                  <span className="mt-2 block h-3 w-3/5 animate-pulse rounded bg-slate-200" />
                  <span className="mt-4 block h-6 w-20 animate-pulse rounded-full bg-slate-200" />
                </span>
              </div>
            ))
          : null}
        {!isLoading && items.length === 0 ? (
          <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">
            {emptyMessage}
          </p>
        ) : null}
        {!isLoading &&
          items.map((item) => {
            const Icon = item.icon;
            const accent = TONE_COLOR[item.tone];

            return (
              <button
                className="flex w-full items-start gap-3 rounded-md border border-slate-100 bg-white p-3 text-left transition hover:border-slate-200 hover:bg-slate-50"
                key={item.title}
              >
                <span
                  className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md"
                  style={{
                    background: `${accent}14`,
                    color: accent,
                  }}
                >
                  <Icon aria-hidden size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {item.meta}
                  </span>
                  <span className="mt-3 block">
                    <StatusChip label={item.status} tone={item.tone} />
                  </span>
                </span>
              </button>
            );
          })}
      </div>
    </aside>
  );
}
