"use client";

import type { ReactNode } from "react";

export function ActionModal({
  children,
  isOpen,
  onClose,
  title,
}: {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        className="w-full max-w-lg rounded-lg border border-[var(--color-operations-border)] bg-[var(--color-operations-panel)] p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="action-modal-title"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white" id="action-modal-title">
            {title}
          </h2>
          <button
            aria-label="Close"
            className="rounded-md px-2 py-1 text-sm text-slate-400 transition hover:text-white"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ModalField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-slate-300">
      <span className="font-semibold">{label}</span>
      {children}
    </label>
  );
}

export function modalInputClassName() {
  return "h-10 rounded-md border border-[var(--color-operations-border)] bg-[#061927] px-3 text-sm text-white outline-none focus:border-[var(--color-brand)]";
}

export function ModalActions({
  onCancel,
  onSubmit,
  submitLabel,
  isSubmitting = false,
}: {
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  isSubmitting?: boolean;
}) {
  return (
    <div className="mt-6 flex justify-end gap-2">
      <button
        className="h-10 rounded-md border border-[var(--color-operations-border)] px-4 text-sm font-bold text-slate-200 transition hover:border-[var(--color-brand)]"
        onClick={onCancel}
        type="button"
      >
        Cancel
      </button>
      <button
        className="h-10 rounded-md bg-[var(--color-brand)] px-4 text-sm font-bold text-[#03111d] transition hover:opacity-90 disabled:opacity-60"
        disabled={isSubmitting}
        onClick={onSubmit}
        type="button"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </div>
  );
}
