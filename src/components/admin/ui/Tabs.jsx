"use client";

import { cn } from "@/lib/utils";

export default function Tabs({ tabs, value, onChange, className }) {
  return (
    <div className={cn("flex gap-6 overflow-x-auto border-b border-[var(--admin-border)]", className)} role="tablist">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 py-3 text-sm font-medium transition-colors",
              active
                ? "border-[var(--color-primary)] text-[var(--admin-text)]"
                : "border-transparent text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]",
            )}
          >
            {tab.label}
            {tab.count != null && (
              <span className="ml-1.5 text-xs text-[var(--admin-text-muted)]">({tab.count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
