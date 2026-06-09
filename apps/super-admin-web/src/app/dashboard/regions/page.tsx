"use client";

import { api } from "@311-security/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
  ActionModal,
  ModalActions,
  ModalField,
  modalInputClassName,
} from "@/components/operations/action-modal";
import { DataTable } from "@/components/operations/data-table";
import { PageHeader } from "@/components/operations/page-header";
import { regionRows } from "@/lib/live-operations-data";

export default function RegionsPage() {
  const createRegion = useMutation(api.regions.create);
  const regions = useQuery(api.regions.list);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("-22.56");
  const [longitude, setLongitude] = useState("17.08");
  const regionItems = regions ?? [];

  const handleCreate = async () => {
    if (!name.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createRegion({
        name: name.trim(),
        description: description.trim() || undefined,
        centerLatitude: Number(latitude),
        centerLongitude: Number(longitude),
      });
      setName("");
      setDescription("");
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Regional coverage" title="All Regions">
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--color-brand)] px-4 text-sm font-bold text-[#03111d] transition hover:opacity-90"
          onClick={() => setIsModalOpen(true)}
          type="button"
        >
          <Plus aria-hidden size={16} />
          Add region
        </button>
      </PageHeader>

      <DataTable
        columns={["Region", "Center", "Signal", "Action"]}
        emptyMessage="No regions configured yet"
        isLoading={regions === undefined}
        rows={regionRows(regionItems)}
      />

      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create region"
      >
        <div className="flex flex-col gap-4">
          <ModalField label="Region name">
            <input
              className={modalInputClassName()}
              onChange={(event) => setName(event.target.value)}
              value={name}
            />
          </ModalField>
          <ModalField label="Description">
            <input
              className={modalInputClassName()}
              onChange={(event) => setDescription(event.target.value)}
              value={description}
            />
          </ModalField>
          <ModalField label="Center latitude">
            <input
              className={modalInputClassName()}
              onChange={(event) => setLatitude(event.target.value)}
              value={latitude}
            />
          </ModalField>
          <ModalField label="Center longitude">
            <input
              className={modalInputClassName()}
              onChange={(event) => setLongitude(event.target.value)}
              value={longitude}
            />
          </ModalField>
        </div>
        <ModalActions
          isSubmitting={isSubmitting}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={() => void handleCreate()}
          submitLabel="Create region"
        />
      </ActionModal>
    </div>
  );
}
