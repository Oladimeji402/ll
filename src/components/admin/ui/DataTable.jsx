"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SkeletonRows } from "./Skeleton";
import Pagination from "./Pagination";

export default function DataTable({
  columns,
  rows,
  rowKey = (row) => row.id,
  sort,
  onSortChange,
  selectable = false,
  selectedIds,
  onToggleRow,
  onToggleAll,
  onRowClick,
  loading = false,
  empty,
  error,
  renderMobileCard,
  pagination,
}) {
  const allSelected = selectable && rows.length > 0 && rows.every((r) => selectedIds?.has(rowKey(r)));

  if (error) return error;

  if (!loading && rows.length === 0) {
    return empty ?? null;
  }

  return (
    <div>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--admin-border)] text-left">
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onToggleAll}
                    aria-label="Select all rows"
                    className="h-4 w-4 accent-[var(--color-primary)]"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]",
                    col.hideBelow === "lg" && "hidden lg:table-cell",
                    col.hideBelow === "md" && "hidden md:table-cell",
                    col.align === "right" && "text-right",
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => onSortChange?.(col.key)}
                      className="inline-flex items-center gap-1 hover:text-[var(--admin-text)]"
                    >
                      {col.header}
                      {sort?.field === col.key ? (
                        sort.direction === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)}>
                  <SkeletonRows rows={6} cols={columns.length} />
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const id = rowKey(row);
                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "border-b border-[var(--admin-border)] last:border-0",
                      onRowClick && "cursor-pointer hover:bg-[var(--admin-surface-alt)]",
                    )}
                  >
                    {selectable && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds?.has(id) ?? false}
                          onChange={() => onToggleRow(id)}
                          aria-label="Select row"
                          className="h-4 w-4 accent-[var(--color-primary)]"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "px-4 py-3 align-middle text-[var(--admin-text)]",
                          col.hideBelow === "lg" && "hidden lg:table-cell",
                          col.hideBelow === "md" && "hidden md:table-cell",
                          col.align === "right" && "text-right",
                        )}
                      >
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="divide-y divide-[var(--admin-border)] sm:hidden">
        {loading ? (
          <SkeletonRows rows={4} cols={2} />
        ) : (
          rows.map((row) => {
            const id = rowKey(row);
            if (renderMobileCard) {
              return (
                <div key={id} onClick={() => onRowClick?.(row)} className={cn("px-4 py-4", onRowClick && "cursor-pointer active:bg-[var(--admin-surface-alt)]")}>
                  {renderMobileCard(row)}
                </div>
              );
            }
            return (
              <div key={id} onClick={() => onRowClick?.(row)} className={cn("flex flex-col gap-1.5 px-4 py-4", onRowClick && "cursor-pointer active:bg-[var(--admin-surface-alt)]")}>
                {columns.map((col) => (
                  <div key={col.key} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-[var(--admin-text-muted)]">{col.header}</span>
                    <span className="text-right text-[var(--admin-text)]">{col.render ? col.render(row) : row[col.key]}</span>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      {pagination && !loading && rows.length > 0 && <Pagination {...pagination} />}
    </div>
  );
}
