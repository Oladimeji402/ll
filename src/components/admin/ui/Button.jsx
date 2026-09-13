"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  primary: "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-dark)] border border-transparent",
  secondary: "bg-[var(--admin-surface)] text-[var(--admin-text)] border border-[var(--admin-border)] hover:bg-[var(--admin-surface-alt)]",
  outline: "bg-transparent text-[var(--admin-text)] border border-[var(--admin-text)]/30 hover:border-[var(--admin-text)] hover:bg-[var(--admin-surface-alt)]",
  ghost: "bg-transparent text-[var(--admin-text-muted)] border border-transparent hover:bg-[var(--admin-surface-alt)] hover:text-[var(--admin-text)]",
  danger: "bg-[var(--admin-danger)] text-white border border-transparent hover:opacity-90",
};

const SIZES = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2",
  icon: "h-9 w-9 shrink-0",
};

export default function Button({
  as: Tag = "button",
  variant = "secondary",
  size = "md",
  className,
  children,
  loading = false,
  disabled = false,
  type = "button",
  ...rest
}) {
  return (
    <Tag
      type={Tag === "button" ? type : undefined}
      disabled={Tag === "button" ? disabled || loading : undefined}
      aria-disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </Tag>
  );
}
