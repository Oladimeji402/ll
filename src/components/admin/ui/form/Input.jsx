import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Input = forwardRef(function Input({ className, error, ...rest }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full border bg-[var(--admin-surface)] px-3 text-sm text-[var(--admin-text)] outline-none transition-colors placeholder:text-[var(--admin-text-muted)] focus:border-[var(--color-primary)]",
        error ? "border-[var(--admin-danger)]" : "border-[var(--admin-border)]",
        className,
      )}
      {...rest}
    />
  );
});

export default Input;
