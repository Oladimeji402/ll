import { X } from "lucide-react";
import Button from "./Button";

export default function BulkActionBar({ count, onClear, actions }) {
  if (!count) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear selection"
          className="flex h-6 w-6 items-center justify-center text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="text-sm text-[var(--admin-text)]">
          <span className="font-medium">{count}</span> selected
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">{actions}</div>
    </div>
  );
}
