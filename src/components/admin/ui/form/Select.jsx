import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = forwardRef(function Select({ className, error, children, ...rest }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-10 w-full appearance-none border bg-[var(--admin-surface)] px-3 pr-9 text-sm text-[var(--admin-text)] outline-none transition-colors focus:border-[var(--color-primary)]",
          error ? "border-[var(--admin-danger)]" : "border-[var(--admin-border)]",
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
    </div>
  );
});

export default Select;
