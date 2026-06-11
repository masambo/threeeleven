"use client";

import { api } from "@311-security/backend/convex/_generated/api";
import type { Id } from "@311-security/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Ambulance, Building2, Flame, Phone, Shield } from "lucide-react";
import { DataTable } from "@/components/operations/data-table";
import { MetricCard } from "@/components/operations/metric-card";
import { PageHeader } from "@/components/operations/page-header";
import type { DataTableRow } from "@/lib/table-rows";
import {
  LIST_PAGE_ARGS,
  emergencyAlertRows,
  emergencyMetrics,
  pageItems,
} from "@/lib/live-operations-data";
import type { LucideIcon } from "lucide-react";

type ServiceType = "police" | "ambulance" | "fire" | "gbv" | "child_protection" | "other";

const SERVICE_TYPES: Array<{ label: string; value: ServiceType }> = [
  { label: "Police", value: "police" },
  { label: "Ambulance", value: "ambulance" },
  { label: "Fire", value: "fire" },
  { label: "GBV", value: "gbv" },
  { label: "Child protection", value: "child_protection" },
  { label: "Other", value: "other" },
];

const SERVICE_ICONS: Record<ServiceType, LucideIcon> = {
  ambulance: Ambulance,
  child_protection: Shield,
  fire: Flame,
  gbv: Shield,
  other: Building2,
  police: Shield,
};

export default function EmergencyPage() {
  const updateStatus = useMutation(api.emergencyAlerts.updateStatus);
  const upsertService = useMutation(api.emergencyServices.upsert);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSavingService, setIsSavingService] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("police");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("Windhoek");
  const [region, setRegion] = useState("Khomas");
  const [notes, setNotes] = useState("");
  const emergencyAlertsResult = useQuery(
    api.emergencyAlerts.activeForAdmin,
    LIST_PAGE_ARGS,
  );
  const emergencyServices = useQuery(api.emergencyServices.active, {});
  const emergencyAlerts = pageItems(emergencyAlertsResult);
  const metrics = emergencyMetrics(emergencyAlerts);

  const handleAction = async (row: DataTableRow) => {
    const alertId = row.id as Id<"emergencyAlerts">;
    const alert = emergencyAlerts.find((item) => item._id === alertId);
    if (!alert || isUpdating) {
      return;
    }

    const nextStatus =
      alert.status === "active"
        ? "responding"
        : alert.status === "responding"
          ? "resolved"
          : "false_alarm";

    setIsUpdating(true);
    try {
      await updateStatus({ alertId, status: nextStatus });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveService = async () => {
    if (!serviceName.trim() || !phoneNumber.trim() || isSavingService) {
      return;
    }

    setIsSavingService(true);
    try {
      await upsertService({
        city: city.trim() || undefined,
        isActive: true,
        isNational: region.trim().length === 0,
        name: serviceName.trim(),
        notes: notes.trim() || undefined,
        phoneNumber: phoneNumber.trim(),
        priority: 10,
        region: region.trim() || undefined,
        type: serviceType,
      });
      setServiceName("");
      setPhoneNumber("");
      setNotes("");
    } finally {
      setIsSavingService(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Community watch" title="Community Alerts" />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Active"
          tone="emergency"
          trend={`${metrics.unassigned} not yet acknowledged`}
          value={metrics.active}
        />
        <MetricCard label="Following up" tone="warning" value={metrics.responding} />
        <MetricCard label="Community notices" tone="safety" value={metrics.services} />
      </div>

      <DataTable
        columns={["ID", "Type", "Location", "Status", "Age", "Action"]}
        emptyMessage="No active community alerts"
        isLoading={emergencyAlertsResult === undefined}
        onAction={handleAction}
        rows={emergencyAlertRows(emergencyAlerts)}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                Mobile directory
              </p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">
                Emergency numbers
              </h3>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              {emergencyServices?.length ?? 0} services
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {(emergencyServices ?? []).map((service) => {
              const Icon = SERVICE_ICONS[service.type as ServiceType] ?? Phone;

              return (
                <div
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                  key={service._id}
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <Icon aria-hidden size={22} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {service.name}
                    </p>
                    <p className="mt-1 text-xl font-black tabular-nums text-blue-700">
                      {service.phoneNumber}
                    </p>
                    {service.notes ? (
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {service.notes}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            Add service
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">
            Emergency contact number
          </h3>

          <div className="mt-4 grid gap-3">
            <input
              className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              onChange={(event) => setServiceName(event.target.value)}
              placeholder="Service name"
              value={serviceName}
            />
            <select
              className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              onChange={(event) => setServiceType(event.target.value as ServiceType)}
              value={serviceType}
            >
              {SERVICE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <input
              className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="Phone number"
              value={phoneNumber}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                onChange={(event) => setCity(event.target.value)}
                placeholder="City"
                value={city}
              />
              <input
                className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                onChange={(event) => setRegion(event.target.value)}
                placeholder="Region"
                value={region}
              />
            </div>
            <textarea
              className="min-h-24 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Notes shown in mobile app"
              value={notes}
            />
            <button
              className="min-h-11 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!serviceName.trim() || !phoneNumber.trim() || isSavingService}
              onClick={() => void handleSaveService()}
              type="button"
            >
              {isSavingService ? "Saving..." : "Add emergency number"}
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
