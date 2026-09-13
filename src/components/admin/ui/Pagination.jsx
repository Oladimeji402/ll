"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Pagination({ page, totalPages, total, pageSize, onPageChange }) {
  if (totalPages <= 1 && total <= pageSize) return null;

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--admin-border)] px-4 py-3">
      <p className="text-xs text-[var(--admin-text-muted)]">
        Showing <span className="text-[var(--admin-text)]">{start}–{end}</span> of{" "}
        <span className="text-[var(--admin-text)]">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={cn(
            "flex h-8 w-8 items-center justify-center border border-[var(--admin-border)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-alt)] disabled:cursor-not-allowed disabled:opacity-40",
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="px-3 text-xs text-[var(--admin-text-muted)]">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex h-8 w-8 items-center justify-center border border-[var(--admin-border)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-alt)] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
