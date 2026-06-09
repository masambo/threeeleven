"use client";

import { api } from "@311-security/backend/convex/_generated/api";
import type { Id } from "@311-security/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { ImagePlus, Megaphone, Plus } from "lucide-react";
import { useState } from "react";
import {
  ActionModal,
  ModalActions,
  ModalField,
  modalInputClassName,
} from "@/components/operations/action-modal";
import { DataTable } from "@/components/operations/data-table";
import { MetricCard } from "@/components/operations/metric-card";
import { PageHeader } from "@/components/operations/page-header";
import type { DataTableRow } from "@/lib/table-rows";
import {
  LIST_PAGE_ARGS,
  pageItems,
  safetyAlertRows,
  safetyMetrics,
} from "@/lib/live-operations-data";

export default function AlertsPage() {
  const createAlert = useMutation(api.safetyAlerts.create);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const setActive = useMutation(api.safetyAlerts.setActive);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [region, setRegion] = useState("Khomas");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const safetyAlertsResult = useQuery(
    api.safetyAlerts.listForAdmin,
    LIST_PAGE_ARGS,
  );
  const safetyAlerts = pageItems(safetyAlertsResult);
  const metrics = safetyMetrics(safetyAlerts);

  const handleAction = async (row: DataTableRow) => {
    const alert = safetyAlerts.find((item) => item._id === row.id);
    if (!alert || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await setActive({
        alertId: row.id as Id<"safetyAlerts">,
        isActive: !alert.isActive,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !message.trim() || selectedImage === null || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadUrl = await generateUploadUrl({});
      const uploadResponse = await fetch(uploadUrl, {
        body: selectedImage,
        headers: {
          "Content-Type": selectedImage.type || "image/jpeg",
        },
        method: "POST",
      });

      if (!uploadResponse.ok) {
        throw new Error("Image upload failed");
      }

      const { storageId } = (await uploadResponse.json()) as {
        storageId: Id<"_storage">;
      };

      await createAlert({
        type: "public_safety",
        title: title.trim(),
        message: message.trim(),
        region,
        imageIds: [storageId],
        severity: "warning",
        priority: "high",
      });
      setTitle("");
      setMessage("");
      setSelectedImage(null);
      setSelectedImagePreview(null);
      setIsModalOpen(false);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not publish alert");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (file: File | undefined) => {
    if (selectedImagePreview !== null) {
      URL.revokeObjectURL(selectedImagePreview);
    }

    if (file === undefined) {
      setSelectedImage(null);
      setSelectedImagePreview(null);
      return;
    }

    setSelectedImage(file);
    setSelectedImagePreview(URL.createObjectURL(file));
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Public communications" title="Safety Alerts">
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--color-brand)] px-4 text-sm font-bold text-[#03111d] transition hover:opacity-90"
          onClick={() => setIsModalOpen(true)}
          type="button"
        >
          <Plus aria-hidden size={16} />
          Create alert
        </button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={Megaphone}
          label="Active alerts"
          tone="brand"
          value={metrics.active}
        />
        <MetricCard label="Critical" tone="emergency" value={metrics.critical} />
        <MetricCard label="Expiring soon" tone="warning" value={metrics.expiring} />
      </div>

      <DataTable
        columns={["ID", "Title", "Region", "Severity", "Priority", "Action"]}
        emptyMessage="No safety alerts have been published"
        isLoading={safetyAlertsResult === undefined}
        onAction={handleAction}
        rows={safetyAlertRows(safetyAlerts)}
      />

      <ActionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          handleImageChange(undefined);
        }}
        title="Create safety alert"
      >
        <div className="flex flex-col gap-4">
          <ModalField label="Title">
            <input
              className={modalInputClassName()}
              onChange={(event) => setTitle(event.target.value)}
              value={title}
            />
          </ModalField>
          <ModalField label="Message">
            <textarea
              className={`${modalInputClassName()} min-h-24 py-2`}
              onChange={(event) => setMessage(event.target.value)}
              value={message}
            />
          </ModalField>
          <ModalField label="Region">
            <input
              className={modalInputClassName()}
              onChange={(event) => setRegion(event.target.value)}
              value={region}
            />
          </ModalField>
          <ModalField label="Alert image">
            <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[var(--color-operations-border)] bg-[#061927] p-4 text-center transition hover:border-[var(--color-brand)]">
              {selectedImagePreview ? (
                <span
                  aria-label="Selected alert"
                  className="h-40 w-full rounded-md bg-cover bg-center"
                  role="img"
                  style={{ backgroundImage: `url(${selectedImagePreview})` }}
                />
              ) : (
                <>
                  <span className="grid h-11 w-11 place-items-center rounded-md bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                    <ImagePlus aria-hidden size={22} />
                  </span>
                  <span className="text-sm font-semibold text-white">
                    Upload a safety alert image
                  </span>
                  <span className="text-xs text-slate-400">
                    JPG, PNG, or WebP image required before publishing
                  </span>
                </>
              )}
              <input
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => handleImageChange(event.target.files?.[0])}
                type="file"
              />
            </label>
            {selectedImage ? (
              <p className="text-xs font-semibold text-slate-400">
                Selected: {selectedImage.name}
              </p>
            ) : null}
          </ModalField>
        </div>
        <ModalActions
          isSubmitting={isSubmitting}
          onCancel={() => {
            setIsModalOpen(false);
            handleImageChange(undefined);
          }}
          onSubmit={() => void handleCreate()}
          submitLabel={selectedImage ? "Publish alert" : "Upload image first"}
        />
      </ActionModal>
    </div>
  );
}
