import { cn } from "@/lib/utils";

const TONES = {
  neutral: "text-[var(--admin-text-muted)] bg-[var(--admin-surface-alt)]",
  success: "text-[var(--admin-success)] bg-[var(--admin-success-bg)]",
  warning: "text-[var(--admin-warning)] bg-[var(--admin-warning-bg)]",
  danger: "text-[var(--admin-danger)] bg-[var(--admin-danger-bg)]",
  info: "text-[var(--admin-info)] bg-[var(--admin-info-bg)]",
  brand: "text-[var(--color-on-primary)] bg-[var(--color-primary)]",
};

export default function Badge({ tone = "neutral", className, children, dot = false }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium leading-none",
        TONES[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />}
      {children}
    </span>
  );
}

const STATUS_TONE = {
  active: "success",
  in_stock: "success",
  "in-stock": "success",
  paid: "success",
  successful: "success",
  completed: "success",
  delivered: "success",
  approved: "success",
  visible: "success",

  pending: "warning",
  processing: "warning",
  scheduled: "warning",
  "low-stock": "warning",
  low_stock: "warning",
  requested: "warning",
  invited: "warning",

  draft: "neutral",
  hidden: "neutral",
  unfulfilled: "neutral",
  disabled: "neutral",

  failed: "danger",
  cancelled: "danger",
  rejected: "danger",
  "out-of-stock": "danger",
  out_of_stock: "danger",
  archived: "danger",
  expired: "danger",
  suspended: "danger",

  shipped: "info",
  refunded: "info",
  returned: "info",
};

export function StatusBadge({ status, className }) {
  const key = String(status ?? "").toLowerCase();
  const tone = STATUS_TONE[key] ?? "neutral";
  const label = key.replace(/[-_]/g, " ");
  return (
    <Badge tone={tone} dot className={cn("capitalize", className)}>
      {label}
    </Badge>
  );
}
