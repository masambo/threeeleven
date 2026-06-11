"use client";

import { api } from "@311-security/backend/convex/_generated/api";
import type { Id } from "@311-security/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { ShieldAlert, UserRoundSearch, UsersRound } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/operations/data-table";
import { MetricCard } from "@/components/operations/metric-card";
import { PageHeader } from "@/components/operations/page-header";
import { LIST_PAGE_ARGS, pageItems, shortId } from "@/lib/live-operations-data";
import type { DataTableRow } from "@/lib/table-rows";

type RiskLevel = "low" | "medium" | "high" | "critical";

const RISK_LEVELS: RiskLevel[] = ["low", "medium", "high", "critical"];

export default function WantedPersonsPage() {
  const createPerson = useMutation(api.wantedPersons.create);
  const setActive = useMutation(api.wantedPersons.setActive);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [alias, setAlias] = useState("");
  const [wantedFor, setWantedFor] = useState("");
  const [lastKnownLocation, setLastKnownLocation] = useState("");
  const [description, setDescription] = useState("");
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("medium");
  const result = useQuery(api.wantedPersons.active, LIST_PAGE_ARGS);
  const people = pageItems(result);

  const handleCreate = async () => {
    if (!name.trim() || !wantedFor.trim() || !description.trim() || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      await createPerson({
        alias: alias.trim() || undefined,
        description: description.trim(),
        isActive: true,
        lastKnownLocation: lastKnownLocation.trim() || undefined,
        name: name.trim(),
        riskLevel,
        wantedFor: wantedFor.trim(),
      });
      setName("");
      setAlias("");
      setWantedFor("");
      setLastKnownLocation("");
      setDescription("");
      setRiskLevel("medium");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAction = async (row: DataTableRow) => {
    await setActive({
      isActive: false,
      personId: row.id as Id<"wantedPersons">,
    });
  };

  const highRisk = people.filter(
    (person) => person.riskLevel === "high" || person.riskLevel === "critical",
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Police notices" title="Wanted Persons" />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={UsersRound}
          label="Active notices"
          tone="brand"
          value={String(people.length)}
        />
        <MetricCard
          icon={ShieldAlert}
          label="High risk"
          tone="emergency"
          value={String(highRisk)}
        />
        <MetricCard
          icon={UserRoundSearch}
          label="Published to app"
          tone="safety"
          value={String(people.length)}
        />
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <DataTable
          columns={["ID", "Name", "Wanted for", "Last known", "Risk", "Action"]}
          emptyMessage="No active wanted notices"
          isLoading={result === undefined}
          onAction={handleAction}
          rows={people.map((person) => ({
            action: "Deactivate",
            cells: [
              shortId("WP", person._id),
              person.name,
              person.wantedFor,
              person.lastKnownLocation ?? "Unknown",
              person.riskLevel,
              "Deactivate",
            ],
            id: person._id,
          }))}
        />

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            Create notice
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">
            Publish wanted person
          </h3>

          <div className="mt-4 grid gap-3">
            <input
              className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              onChange={(event) => setName(event.target.value)}
              placeholder="Full name"
              value={name}
            />
            <input
              className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              onChange={(event) => setAlias(event.target.value)}
              placeholder="Alias"
              value={alias}
            />
            <input
              className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              onChange={(event) => setWantedFor(event.target.value)}
              placeholder="Wanted for"
              value={wantedFor}
            />
            <input
              className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              onChange={(event) => setLastKnownLocation(event.target.value)}
              placeholder="Last known location"
              value={lastKnownLocation}
            />
            <select
              className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              onChange={(event) => setRiskLevel(event.target.value as RiskLevel)}
              value={riskLevel}
            >
              {RISK_LEVELS.map((risk) => (
                <option key={risk} value={risk}>
                  {risk}
                </option>
              ))}
            </select>
            <textarea
              className="min-h-28 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description"
              value={description}
            />
            <button
              className="min-h-11 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!name.trim() || !wantedFor.trim() || !description.trim() || isSaving}
              onClick={() => void handleCreate()}
              type="button"
            >
              {isSaving ? "Publishing..." : "Publish notice"}
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
