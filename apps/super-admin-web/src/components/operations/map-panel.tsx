"use client";

import { AlertTriangle, Layers, MapPin, RadioTower, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { StatusChip } from "./status-chip";
import type { MapLayer, MapMarker } from "@/lib/operations-data";
import type { LucideIcon } from "lucide-react";

const layerConfig: Record<
  MapLayer,
  { label: string; icon: LucideIcon }
> = {
  alert: { icon: RadioTower, label: "Alerts" },
  emergency: { icon: ShieldAlert, label: "Emergency" },
  region: { icon: Layers, label: "Regions" },
  report: { icon: MapPin, label: "Reports" },
  zone: { icon: AlertTriangle, label: "Zones" },
};

const layerOrder: MapLayer[] = ["emergency", "report", "zone", "alert", "region"];

export function MapPanel({
  detailStats,
  detailTitle = "Windhoek, Khomas",
  detailSubtitle = "Active emergency cluster",
  markers,
}: {
  detailStats?: Array<{ label: string; value: string }>;
  detailTitle?: string;
  detailSubtitle?: string;
  markers: MapMarker[];
}) {
  const availableLayers = useMemo(() => {
    const layers = new Set<MapLayer>();
    markers.forEach((marker) => layers.add(marker.layer ?? "region"));
    return Array.from(layers);
  }, [markers]);
  const [activeLayers, setActiveLayers] = useState<Set<MapLayer>>(
    () => new Set(layerOrder),
  );
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const stats =
    detailStats ??
    [
      { label: "Emergency alerts", value: "3 active" },
      { label: "Crime reports", value: "8 pending" },
    ];
  const visibleMarkers = markers.filter((marker) =>
    activeLayers.has(marker.layer ?? "region"),
  );
  const selectedMarker =
    visibleMarkers.find((marker) => marker.label === selectedLabel) ??
    visibleMarkers[0];

  function toggleLayer(layer: MapLayer) {
    setActiveLayers((current) => {
      const next = new Set(current);
      if (next.has(layer) && next.size > 1) {
        next.delete(layer);
      } else {
        next.add(layer);
      }

      return next;
    });
  }

  return (
    <section className="relative min-h-[560px] overflow-hidden rounded-lg border border-[var(--color-operations-border)] bg-[var(--color-operations-bg)]">
      <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(var(--color-operations-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-operations-border)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle,var(--color-map-land-dot)_1px,transparent_1.5px)] [background-size:10px_10px]" />
      <div className="absolute left-[18%] top-[7%] h-[84%] w-[56%] bg-[rgba(32,72,92,0.34)] shadow-[0_0_80px_var(--color-map-glow)] [clip-path:polygon(42%_0%,58%_5%,64%_15%,63%_28%,72%_37%,69%_51%,78%_66%,73%_80%,60%_100%,43%_92%,35%_78%,24%_66%,29%_52%,21%_39%,30%_25%,31%_11%)]" />
      <div className="absolute left-[22%] top-[12%] h-[72%] w-[48%] border border-[var(--color-operations-border)] opacity-60 [clip-path:polygon(42%_0%,58%_5%,64%_15%,63%_28%,72%_37%,69%_51%,78%_66%,73%_80%,60%_100%,43%_92%,35%_78%,24%_66%,29%_52%,21%_39%,30%_25%,31%_11%)]" />
      <div className="absolute left-[6%] top-6 z-10 flex flex-wrap gap-2">
        {availableLayers.map((layer) => {
          const Icon = layerConfig[layer].icon;
          const isActive = activeLayers.has(layer);

          return (
            <button
              className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-bold transition ${
                isActive
                  ? "border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-[var(--color-brand)]"
                  : "border-[var(--color-operations-border)] bg-[var(--color-operations-panel)] text-slate-400"
              }`}
              key={layer}
              onClick={() => toggleLayer(layer)}
              type="button"
            >
              <Icon aria-hidden size={14} />
              {layerConfig[layer].label}
            </button>
          );
        })}
      </div>

      {visibleMarkers.map((marker) => (
        <button
          className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full text-left outline-none transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"
          key={marker.label}
          onClick={() => setSelectedLabel(marker.label)}
          style={{ left: marker.left, top: marker.top }}
          type="button"
        >
          {marker.layer === "zone" ? (
            <span
              className="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border"
              style={{
                borderColor: `var(--color-${marker.tone})`,
                height: marker.radius ?? "60px",
                opacity: 0.35,
                width: marker.radius ?? "60px",
              }}
            />
          ) : null}
          <span
            aria-label={marker.label}
            className={`h-3.5 w-3.5 rounded-full shadow-[0_0_16px_currentColor] ${
              marker.layer === "emergency" ? "animate-ping" : ""
            }`}
            style={{
              background: "currentColor",
              color: `var(--color-${marker.tone})`,
            }}
          />
          <span className="rounded-full border border-[var(--color-operations-border)] bg-[var(--color-operations-panel)] px-2 py-1 text-xs font-bold tabular-nums">
            {marker.count}
          </span>
        </button>
      ))}

      <div className="absolute bottom-6 left-6 z-20 w-[min(86%,22rem)] rounded-lg border border-[var(--color-operations-border)] bg-[rgba(10,32,48,0.94)] p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold">{selectedMarker?.title ?? detailTitle}</p>
            <p className="mt-1 text-sm font-semibold text-[var(--color-emergency)]">
              {selectedMarker?.meta ?? detailSubtitle}
            </p>
          </div>
          {selectedMarker?.status ? <StatusChip label={selectedMarker.status} /> : null}
        </div>
        {selectedMarker?.description ? (
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {selectedMarker.description}
          </p>
        ) : null}
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          {(selectedMarker?.details ?? stats).slice(0, 4).map((stat) => (
            <div className="rounded-md bg-[#061927] p-3" key={stat.label}>
              <p className="text-slate-400">{stat.label}</p>
              <p className="mt-1 font-semibold tabular-nums">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-20 hidden rounded-lg border border-[var(--color-operations-border)] bg-[rgba(10,32,48,0.9)] px-3 py-2 text-xs font-semibold text-slate-300 md:block">
        {visibleMarkers.length} mapped signals
      </div>
    </section>
  );
}
