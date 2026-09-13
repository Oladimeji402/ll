"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchInput({ value, onChange, placeholder = "Search", className }) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full border border-[var(--admin-border)] bg-[var(--admin-surface)] pl-9 pr-9 text-sm text-[var(--admin-text)] outline-none placeholder:text-[var(--admin-text-muted)] focus:border-[var(--color-primary)]"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
