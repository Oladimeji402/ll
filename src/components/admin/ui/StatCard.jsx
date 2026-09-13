import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/admin/utils/format";

export default function StatCard({ label, value, change, changeLabel = "vs previous period", trend, invert = false }) {
  const isPositive = change >= 0;
  const good = invert ? !isPositive : isPositive;

  return (
    <div className="min-w-0 border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 sm:p-5">
      <p className="truncate text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">{label}</p>
      <p className="mt-3 truncate text-xl font-semibold tabular-nums text-[var(--admin-text)]" title={String(value)}>
        {value}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        <div className={cn("flex items-center gap-1 text-xs font-medium", good ? "text-[var(--admin-success)]" : "text-[var(--admin-danger)]")}>
          {isPositive ? <ArrowUpRight className="h-3.5 w-3.5 shrink-0" /> : <ArrowDownRight className="h-3.5 w-3.5 shrink-0" />}
          {formatPercent(Math.abs(change))}
        </div>
        <span className="truncate text-xs font-normal text-[var(--admin-text-muted)]">{changeLabel}</span>
        {trend}
      </div>
    </div>
  );
}
