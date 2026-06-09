"use client";

import L from "leaflet";
import { Fragment } from "react";
import { Circle, MapContainer, Marker, Polygon, TileLayer } from "react-leaflet";
import type { MapMarker } from "@/lib/operations-data";

const NAMIBIA_CENTER: [number, number] = [-22.56, 17.08];
const NAMIBIA_BOUNDS: [[number, number], [number, number]] = [
  [-29.4, 11.2],
  [-16.6, 25.8],
];

const layerClassNames = {
  alert: "leaflet-signal-marker--alert",
  emergency: "leaflet-signal-marker--emergency",
  region: "leaflet-signal-marker--region",
  report: "leaflet-signal-marker--report",
  zone: "leaflet-signal-marker--zone",
} as const;

function markerIcon(marker: MapMarker) {
  const layer = marker.layer ?? "region";

  return L.divIcon({
    className: "leaflet-signal-icon",
    html: `<span class="leaflet-signal-marker ${layerClassNames[layer]} ${
      layer === "emergency" ? "leaflet-signal-marker--pulse" : ""
    }"><span>${marker.count}</span></span>`,
    iconAnchor: [14, 14],
    iconSize: [28, 28],
  });
}

function markerColor(marker: MapMarker) {
  return `var(--color-${marker.tone})`;
}

export function MapLeafletView({
  markers,
  onSelect,
  selectedMarkerId,
}: {
  markers: MapMarker[];
  onSelect: (marker: MapMarker) => void;
  selectedMarkerId?: string;
}) {
  return (
    <MapContainer
      attributionControl={false}
      bounds={NAMIBIA_BOUNDS}
      center={NAMIBIA_CENTER}
      className="h-full min-h-[560px] w-full"
      maxBounds={NAMIBIA_BOUNDS}
      maxBoundsViscosity={0.8}
      minZoom={5}
      scrollWheelZoom
      zoom={6}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {markers.map((marker) => {
        const key = marker.id ?? marker.label;
        const isSelected = selectedMarkerId === key;
        const color = markerColor(marker);
        const polygonPoints = marker.geometry?.points?.map(
          (point) => [point.latitude, point.longitude] as [number, number],
        );

        return (
          <Fragment key={key}>
            {marker.geometry?.type === "circle" ? (
              <Circle
                center={[marker.latitude, marker.longitude]}
                eventHandlers={{ click: () => onSelect(marker) }}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: isSelected ? 0.28 : 0.16,
                  opacity: isSelected ? 0.9 : 0.55,
                  weight: isSelected ? 3 : 2,
                }}
                radius={marker.geometry.radiusMeters ?? 250}
              />
            ) : null}

            {marker.geometry?.type === "polygon" && polygonPoints !== undefined ? (
              <Polygon
                eventHandlers={{ click: () => onSelect(marker) }}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: isSelected ? 0.3 : 0.18,
                  opacity: isSelected ? 0.9 : 0.6,
                  weight: isSelected ? 3 : 2,
                }}
                positions={polygonPoints}
              />
            ) : null}

            <Marker
              eventHandlers={{ click: () => onSelect(marker) }}
              icon={markerIcon(marker)}
              position={[marker.latitude, marker.longitude]}
              zIndexOffset={isSelected ? 1000 : 0}
            />
          </Fragment>
        );
      })}
    </MapContainer>
  );
}
