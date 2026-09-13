import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Textarea = forwardRef(function Textarea({ className, error, rows = 4, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "w-full resize-y border bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)] outline-none transition-colors placeholder:text-[var(--admin-text-muted)] focus:border-[var(--color-primary)]",
        error ? "border-[var(--admin-danger)]" : "border-[var(--admin-border)]",
        className,
      )}
      {...rest}
    />
  );
});

export default Textarea;
