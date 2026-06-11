"use client";

import dynamic from "next/dynamic";
import { AlertTriangle, Layers, MapPin, RadioTower, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { StatusChip } from "./status-chip";
import type { MapLayer, MapMarker } from "@/lib/operations-data";
import type { LucideIcon } from "lucide-react";

const MapLeafletView = dynamic(
  () =>
    import("./map-leaflet-view").then((module) => module.MapLeafletView),
  {
    loading: () => (
      <div className="grid h-full min-h-[560px] place-items-center bg-slate-50 text-sm font-semibold text-slate-500">
        Loading live map...
      </div>
    ),
    ssr: false,
  },
);

const layerConfig: Record<
  MapLayer,
  { label: string; icon: LucideIcon }
> = {
  alert: { icon: RadioTower, label: "Safety alerts" },
  emergency: { icon: ShieldAlert, label: "Emergency" },
  heat: { icon: AlertTriangle, label: "Crime heat" },
  region: { icon: Layers, label: "Regions" },
  report: { icon: MapPin, label: "Crime reports" },
  zone: { icon: AlertTriangle, label: "Danger zones" },
};

const layerOrder: MapLayer[] = ["emergency", "heat", "report", "alert", "region"];

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
    return layers;
  }, [markers]);
  const [activeLayers, setActiveLayers] = useState<Set<MapLayer>>(
    () => new Set(layerOrder),
  );
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const stats =
    detailStats ??
    [
      { label: "Emergency alerts", value: "3 active" },
      { label: "Crime reports", value: "8 pending" },
    ];
  const visibleMarkers = markers.filter((marker) =>
    activeLayers.has(marker.layer ?? "region"),
  );
  const selectedKey = selectedMarkerId;
  const selectedMarker =
    visibleMarkers.find((marker) => (marker.id ?? marker.label) === selectedKey) ??
    visibleMarkers[0];
  const mappedCounts = layerOrder.map((layer) => ({
    ...layerConfig[layer],
    count: markers.filter((marker) => (marker.layer ?? "region") === layer).length,
    layer,
  }));

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
    <section className="grid overflow-hidden rounded-lg border border-[var(--color-operations-border)] bg-[var(--color-operations-bg)] xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="relative min-h-[560px]">
        <MapLeafletView
          markers={visibleMarkers}
          onSelect={(marker) => setSelectedMarkerId(marker.id ?? marker.label)}
          selectedMarkerId={selectedMarker?.id ?? selectedMarker?.label}
        />

        <div className="absolute left-4 top-4 z-[500] flex max-w-[calc(100%-2rem)] flex-wrap gap-2">
          {layerOrder.map((layer) => {
          const Icon = layerConfig[layer].icon;
          const isActive = activeLayers.has(layer);
          const hasLayerMarkers = availableLayers.has(layer);

          return (
            <button
              className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-bold transition ${
                isActive
                  ? "border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-[var(--color-brand)]"
                  : "border-[var(--color-operations-border)] bg-[var(--color-operations-panel)] text-slate-400"
              } disabled:cursor-not-allowed disabled:opacity-45`}
              disabled={!hasLayerMarkers}
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

        <div className="absolute bottom-4 right-4 z-[500] rounded-lg border border-[var(--color-operations-border)] bg-[rgba(10,32,48,0.9)] px-3 py-2 text-xs font-semibold text-slate-300">
          {visibleMarkers.length} mapped signals
        </div>
      </div>

      <aside className="border-t border-[var(--color-operations-border)] bg-[rgba(10,32,48,0.94)] p-4 xl:border-l xl:border-t-0">
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

        <div className="mt-5 border-t border-[var(--color-operations-border)] pt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Visible layers
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {mappedCounts.map((item) => {
              const Icon = item.icon;
              return (
                <div className="rounded-md bg-[#061927] p-3" key={item.layer}>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Icon aria-hidden size={14} />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </div>
                  <p className="mt-2 text-lg font-semibold tabular-nums">
                    {item.count}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </section>
  );
}
