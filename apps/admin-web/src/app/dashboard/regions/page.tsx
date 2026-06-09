"use client";

import { api } from "@311-security/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { DataTable } from "@/components/operations/data-table";
import { MapPanel } from "@/components/operations/map-panel";
import { PageHeader } from "@/components/operations/page-header";
import {
  LIST_PAGE_ARGS,
  mapMarkers,
  pageItems,
  regionRows,
} from "@/lib/live-operations-data";

export default function RegionsPage() {
  const regions = useQuery(api.regions.list);
  const crimeReportsResult = useQuery(
    api.crimeReports.listForAdmin,
    LIST_PAGE_ARGS,
  );
  const dangerZonesResult = useQuery(api.dangerZones.active, LIST_PAGE_ARGS);
  const emergencyAlertsResult = useQuery(
    api.emergencyAlerts.activeForAdmin,
    LIST_PAGE_ARGS,
  );
  const safetyAlertsResult = useQuery(
    api.safetyAlerts.listForAdmin,
    LIST_PAGE_ARGS,
  );
  const regionItems = regions ?? [];
  const crimeReports = pageItems(crimeReportsResult);
  const dangerZones = pageItems(dangerZonesResult);
  const emergencyAlerts = pageItems(emergencyAlertsResult);
  const safetyAlerts = pageItems(safetyAlertsResult);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Regional coverage" title="Regions" />

      <p className="text-sm text-slate-400">
        Region creation is managed in the super-admin console.
      </p>

      <MapPanel
        detailStats={[
          { label: "Regions", value: `${regionItems.length} configured` },
          { label: "Active work", value: `${crimeReports.length + dangerZones.length} items` },
        ]}
        detailSubtitle="Admin coverage and active work"
        detailTitle="Namibia regional coverage"
        markers={mapMarkers({
          crimeReports,
          dangerZones,
          emergencyAlerts,
          regions: regionItems,
          safetyAlerts,
        })}
      />

      <DataTable
        columns={["Region", "Center", "Signal", "Action"]}
        emptyMessage="No regions configured yet"
        isLoading={regions === undefined}
        rows={regionRows(regionItems)}
      />
    </div>
  );
}
