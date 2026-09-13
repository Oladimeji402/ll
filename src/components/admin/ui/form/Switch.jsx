"use client";

import { cn } from "@/lib/utils";

export default function Switch({ checked, onChange, label, description, disabled, className }) {
  return (
    <label className={cn("flex cursor-pointer items-start justify-between gap-4", disabled && "cursor-not-allowed opacity-50", className)}>
      {(label || description) && (
        <span className="flex flex-col">
          {label && <span className="text-sm font-medium text-[var(--admin-text)]">{label}</span>}
          {description && <span className="text-xs text-[var(--admin-text-muted)]">{description}</span>}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full border transition-colors",
          checked
            ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
            : "border-[var(--admin-border)] bg-[var(--admin-surface-alt)]",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-transform",
            checked ? "translate-x-[18px]" : "translate-x-0.5",
          )}
        />
      </button>
    </label>
  );
}
