import type { LucideIcon } from "lucide-react";
import type { Tone } from "@/lib/operations-data";
import { StatusChip } from "./status-chip";

export function QueuePanel({
  emptyMessage = "No priority items",
  isLoading = false,
  items,
  title = "Priority Queue",
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
    <aside className="rounded-lg border border-[var(--color-operations-border)] bg-[var(--color-operations-panel)] p-4">
      <h3 className="text-base font-semibold">{title}</h3>
      <div className="mt-4 flex flex-col gap-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                className="flex w-full items-start gap-3 rounded-md bg-[#061927] p-3"
                key={`queue-loading-${index}`}
              >
                <span className="mt-0.5 h-8 w-8 shrink-0 animate-pulse rounded-md bg-slate-700/60" />
                <span className="min-w-0 flex-1">
                  <span className="block h-4 w-4/5 animate-pulse rounded bg-slate-700/60" />
                  <span className="mt-2 block h-3 w-3/5 animate-pulse rounded bg-slate-700/50" />
                  <span className="mt-4 block h-6 w-20 animate-pulse rounded-full bg-slate-700/40" />
                </span>
              </div>
            ))
          : null}
        {!isLoading && items.length === 0 ? (
          <p className="rounded-md bg-[#061927] p-4 text-sm text-slate-400">
            {emptyMessage}
          </p>
        ) : null}
        {!isLoading && items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              className="flex w-full items-start gap-3 rounded-md bg-[#061927] p-3 text-left transition hover:bg-[var(--color-operations-panel-subtle)]"
              key={item.title}
            >
              <span
                className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md"
                style={{
                  background: `color-mix(in srgb, var(--color-${item.tone}) 14%, transparent)`,
                  color: `var(--color-${item.tone})`,
                }}
              >
                <Icon aria-hidden size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{item.title}</span>
                <span className="mt-1 block text-xs text-slate-400">{item.meta}</span>
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
