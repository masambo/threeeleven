import type { Tone } from "@/lib/operations-data";

const toneClasses: Record<Tone, string> = {
  brand: "border-[var(--color-brand)]/40 bg-[var(--color-brand)]/10 text-[var(--color-brand)]",
  emergency:
    "border-[var(--color-emergency)]/40 bg-[var(--color-emergency)]/10 text-[var(--color-emergency)]",
  muted: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  safety:
    "border-[var(--color-safety)]/40 bg-[var(--color-safety)]/10 text-[var(--color-safety)]",
  warning:
    "border-[var(--color-warning)]/40 bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
};

export function toneForStatus(status: string): Tone {
  const normalized = status.toLowerCase();

  if (["active", "critical"].includes(normalized)) {
    return "emergency";
  }

  if (["pending", "warning", "responding", "high"].includes(normalized)) {
    return "warning";
  }

  if (["resolved", "approved", "verified", "online"].includes(normalized)) {
    return "safety";
  }

  if (["investigating", "info", "medium", "review"].includes(normalized)) {
    return "brand";
  }

  return "muted";
}

export function StatusChip({ label, tone }: { label: string; tone?: Tone }) {
  return (
    <span
      className={`inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-bold ${toneClasses[tone ?? toneForStatus(label)]}`}
    >
      {label}
    </span>
  );
}
