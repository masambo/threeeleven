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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {columns.map((column) => (
              <th className="px-4 py-3 font-semibold" key={column}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr
                  className="border-t border-slate-100"
                  key={`loading-${rowIndex}`}
                >
                  {columns.map((column) => (
                    <td className="px-4 py-3" key={`${column}-${rowIndex}`}>
                      <span className="block h-4 w-full max-w-28 animate-pulse rounded bg-slate-200" />
                    </td>
                  ))}
                </tr>
              ))
            : null}
          {!isLoading && rows.length === 0 ? (
            <tr className="border-t border-slate-100">
              <td
                className="px-4 py-8 text-center text-sm text-slate-400"
                colSpan={columns.length}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : null}
          {!isLoading &&
            rows.map((row) => (
              <tr
                className="border-t border-slate-100 transition hover:bg-slate-50"
                key={row.id}
              >
                {row.cells.map((cell, index) => (
                  <td className="px-4 py-3" key={`${row.id}-${cell}-${index}`}>
                    {index === 3 || index === 4 ? (
                      <StatusChip label={cell} />
                    ) : index === row.cells.length - 1 ? (
                      <button
                        className="inline-flex h-8 items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!onAction}
                        onClick={() => onAction?.(row)}
                        type="button"
                      >
                        {row.action}
                        <ArrowUpRight aria-hidden size={14} />
                      </button>
                    ) : (
                      <span
                        className={
                          index === 0
                            ? "font-semibold text-slate-900"
                            : "text-slate-600"
                        }
                      >
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
