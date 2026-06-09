import { ArrowUpRight } from "lucide-react";
import type { DataTableRow } from "@/lib/table-rows";
import { StatusChip } from "./status-chip";

export function DataTable({
  columns,
  emptyMessage = "No records found",
  isLoading = false,
  onAction,
  rows,
}: {
  columns: string[];
  emptyMessage?: string;
  isLoading?: boolean;
  onAction?: (row: DataTableRow) => void;
  rows: DataTableRow[];
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-operations-border)] bg-[var(--color-operations-panel)]">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-[#061927] text-xs uppercase tracking-wide text-slate-400">
          <tr>
            {columns.map((column) => (
              <th className="px-4 py-3 font-bold" key={column}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr
                  className="border-t border-[var(--color-operations-border)]"
                  key={`loading-${rowIndex}`}
                >
                  {columns.map((column) => (
                    <td className="px-4 py-3" key={`${column}-${rowIndex}`}>
                      <span className="block h-4 w-full max-w-28 animate-pulse rounded bg-slate-700/60" />
                    </td>
                  ))}
                </tr>
              ))
            : null}
          {!isLoading && rows.length === 0 ? (
            <tr className="border-t border-[var(--color-operations-border)]">
              <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          ) : null}
          {!isLoading && rows.map((row) => (
            <tr
              className="border-t border-[var(--color-operations-border)] transition hover:bg-[var(--color-operations-panel-subtle)]"
              key={row.id}
            >
              {row.cells.map((cell, index) => (
                <td className="px-4 py-3" key={`${row.id}-${cell}-${index}`}>
                  {index === 3 || index === 4 ? (
                    <StatusChip label={cell} />
                  ) : index === row.cells.length - 1 ? (
                    <button
                      className="inline-flex h-8 items-center gap-2 rounded-md border border-[var(--color-operations-border)] px-2.5 text-xs font-bold text-slate-200 transition hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!onAction}
                      onClick={() => onAction?.(row)}
                      type="button"
                    >
                      {row.action}
                      <ArrowUpRight aria-hidden size={14} />
                    </button>
                  ) : (
                    <span className={index === 0 ? "font-semibold text-white" : "text-slate-300"}>
                      {cell}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
