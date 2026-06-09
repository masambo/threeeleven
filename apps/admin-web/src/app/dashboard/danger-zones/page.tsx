"use client";

import { api } from "@311-security/backend/convex/_generated/api";
import type { Id } from "@311-security/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { MapPinned, Plus } from "lucide-react";
import { useState } from "react";
import {
  ActionModal,
  ModalActions,
  ModalField,
  modalInputClassName,
} from "@/components/operations/action-modal";
import { DataTable } from "@/components/operations/data-table";
import { MapPanel } from "@/components/operations/map-panel";
import { MetricCard } from "@/components/operations/metric-card";
import { PageHeader } from "@/components/operations/page-header";
import type { DataTableRow } from "@/lib/table-rows";
import {
  LIST_PAGE_ARGS,
  dangerZoneRows,
  dangerZoneSignals,
  mapMarkers,
  pageItems,
} from "@/lib/live-operations-data";

export default function DangerZonesPage() {
  const createZone = useMutation(api.dangerZones.create);
  const setActive = useMutation(api.dangerZones.setActive);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [region, setRegion] = useState("Khomas");
  const [city, setCity] = useState("Windhoek");
  const [latitude, setLatitude] = useState("-22.5609");
  const [longitude, setLongitude] = useState("17.0658");
  const [radius, setRadius] = useState("500");
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high" | "critical">("high");
  const [warningMessage, setWarningMessage] = useState("Exercise caution in this area");
  const dangerZonesResult = useQuery(api.dangerZones.active, LIST_PAGE_ARGS);
  const crimeReportsResult = useQuery(
    api.crimeReports.listForAdmin,
    LIST_PAGE_ARGS,
  );
  const emergencyAlertsResult = useQuery(
    api.emergencyAlerts.activeForAdmin,
    LIST_PAGE_ARGS,
  );
  const safetyAlertsResult = useQuery(
    api.safetyAlerts.listForAdmin,
    LIST_PAGE_ARGS,
  );
  const regions = useQuery(api.regions.list);
  const dangerZones = pageItems(dangerZonesResult);
  const crimeReports = pageItems(crimeReportsResult);
  const emergencyAlerts = pageItems(emergencyAlertsResult);
  const safetyAlerts = pageItems(safetyAlertsResult);
  const regionItems = regions ?? [];
  const signals = dangerZoneSignals(dangerZones);
  const markers = mapMarkers({
    crimeReports,
    dangerZones,
    emergencyAlerts,
    regions: regionItems,
    safetyAlerts,
  });

  const handleAction = async (row: DataTableRow) => {
    const zone = dangerZones.find((item) => item._id === row.id);
    if (!zone || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await setActive({
        dangerZoneId: row.id as Id<"dangerZones">,
        isActive: !zone.isActive,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const rad = parseInt(radius, 10);

      if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
        return;
      }

      await createZone({
        name: name.trim(),
        geometryType: "circle",
        centerLatitude: lat,
        centerLongitude: lng,
        radiusMeters: rad,
        riskLevel,
        region,
        city,
        warningMessage: warningMessage.trim() || "Exercise caution in this area",
      });
      setName("");
      setLatitude("-22.5609");
      setLongitude("17.0658");
      setRadius("500");
      setRiskLevel("high");
      setWarningMessage("Exercise caution in this area");
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Geospatial risk" title="Danger Zones">
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--color-brand)] px-4 text-sm font-bold text-[#03111d] transition hover:opacity-90"
          onClick={() => setIsModalOpen(true)}
          type="button"
        >
          <Plus aria-hidden size={16} />
          Add zone
        </button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2">
        {signals.map((signal) => (
          <MetricCard
            icon={signal.icon}
            key={signal.label}
            label={signal.label}
            tone={signal.tone}
            value={signal.value}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <MapPanel
          detailStats={[
            { label: "Active zones", value: `${dangerZones.length} mapped` },
            { label: "Regions", value: `${regionItems.length} configured` },
          ]}
          detailSubtitle="High-risk zone cluster"
          detailTitle="Windhoek risk corridor"
          markers={markers}
        />
        <div className="rounded-lg border border-[var(--color-operations-border)] bg-[var(--color-operations-panel)] p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
              <MapPinned aria-hidden size={20} />
            </span>
            <div>
              <h3 className="font-semibold">Map Editor</h3>
              <p className="text-sm text-slate-400">Circle and polygon zones</p>
            </div>
          </div>
          <div className="mt-4 h-64 rounded-lg border border-dashed border-[var(--color-operations-border)] bg-[#061927]" />
        </div>
      </div>

      <DataTable
        columns={["ID", "Name", "Region", "Risk", "Geometry", "Action"]}
        emptyMessage="No active danger zones"
        isLoading={dangerZonesResult === undefined}
        onAction={handleAction}
        rows={dangerZoneRows(dangerZones)}
      />

      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add danger zone"
      >
        <div className="flex flex-col gap-4">
          <ModalField label="Zone / crime spot name">
            <input
              className={modalInputClassName()}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Katutura market area"
              value={name}
            />
          </ModalField>
          <ModalField label="Warning message">
            <input
              className={modalInputClassName()}
              onChange={(event) => setWarningMessage(event.target.value)}
              placeholder="Brief safety advisory for this zone"
              value={warningMessage}
            />
          </ModalField>
          <div className="grid grid-cols-2 gap-3">
            <ModalField label="Latitude">
              <input
                className={modalInputClassName()}
                inputMode="decimal"
                onChange={(event) => setLatitude(event.target.value)}
                placeholder="-22.5609"
                value={latitude}
              />
            </ModalField>
            <ModalField label="Longitude">
              <input
                className={modalInputClassName()}
                inputMode="decimal"
                onChange={(event) => setLongitude(event.target.value)}
                placeholder="17.0658"
                value={longitude}
              />
            </ModalField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ModalField label="Radius (metres)">
              <input
                className={modalInputClassName()}
                inputMode="numeric"
                onChange={(event) => setRadius(event.target.value)}
                placeholder="500"
                value={radius}
              />
            </ModalField>
            <ModalField label="Risk level">
              <select
                className={modalInputClassName()}
                onChange={(event) =>
                  setRiskLevel(event.target.value as typeof riskLevel)
                }
                value={riskLevel}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </ModalField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ModalField label="Region">
              <input
                className={modalInputClassName()}
                onChange={(event) => setRegion(event.target.value)}
                value={region}
              />
            </ModalField>
            <ModalField label="City">
              <input
                className={modalInputClassName()}
                onChange={(event) => setCity(event.target.value)}
                value={city}
              />
            </ModalField>
          </div>
        </div>
        <ModalActions
          isSubmitting={isSubmitting}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={() => void handleCreate()}
          submitLabel="Create zone"
        />
      </ActionModal>
    </div>
  );
}
