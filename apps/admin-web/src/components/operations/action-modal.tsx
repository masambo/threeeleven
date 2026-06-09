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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div
        aria-labelledby="action-modal-title"
        aria-modal="true"
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        role="dialog"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="text-lg font-semibold text-slate-900"
            id="action-modal-title"
          >
            {title}
          </h2>
          <button
            aria-label="Close"
            className="rounded-md px-2 py-1 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
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
    <label className="flex flex-col gap-1.5 text-sm text-slate-700">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}

export function modalInputClassName() {
  return "h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
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
        className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        onClick={onCancel}
        type="button"
      >
        Cancel
      </button>
      <button
        className="h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        disabled={isSubmitting}
        onClick={onSubmit}
        type="button"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </div>
  );
}
