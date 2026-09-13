"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { RANGE_PRESETS } from "@/lib/admin/utils/date-range";
import Button from "./Button";
import Input from "./form/Input";

export default function DateRangePicker({ value, custom, onChange }) {
  const [open, setOpen] = useState(false);
  const [draftCustom, setDraftCustom] = useState(custom ?? { from: "", to: "" });
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const activeLabel = RANGE_PRESETS.find((p) => p.key === value)?.label ?? "Last 30 days";

  return (
    <div className="relative" ref={ref}>
      <Button variant="secondary" size="sm" onClick={() => setOpen((o) => !o)}>
        <Calendar className="h-3.5 w-3.5" />
        {activeLabel}
        <ChevronDown className="h-3.5 w-3.5" />
      </Button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-72 max-w-[calc(100vw-2rem)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-2 shadow-lg">
          {RANGE_PRESETS.filter((p) => p.key !== "custom").map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => {
                onChange(preset.key);
                setOpen(false);
              }}
              className={cn(
                "block w-full px-3 py-2 text-left text-sm hover:bg-[var(--admin-surface-alt)]",
                value === preset.key && "bg-[var(--admin-surface-alt)] font-medium",
              )}
            >
              {preset.label}
            </button>
          ))}
          <div className="mt-1 border-t border-[var(--admin-border)] pt-2">
            <p className="px-3 pb-1.5 text-xs font-medium text-[var(--admin-text-muted)]">Custom range</p>
            <div className="flex flex-col gap-2 px-3">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] text-[var(--admin-text-muted)]">From</span>
                <Input
                  type="date"
                  value={draftCustom.from}
                  onChange={(e) => setDraftCustom((d) => ({ ...d, from: e.target.value }))}
                  className="h-9 w-full min-w-0 text-xs"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] text-[var(--admin-text-muted)]">To</span>
                <Input
                  type="date"
                  value={draftCustom.to}
                  onChange={(e) => setDraftCustom((d) => ({ ...d, to: e.target.value }))}
                  className="h-9 w-full min-w-0 text-xs"
                />
              </label>
            </div>
            <div className="px-3 pt-2">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                disabled={!draftCustom.from || !draftCustom.to}
                onClick={() => {
                  onChange("custom", draftCustom);
                  setOpen(false);
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
