import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Checkbox = forwardRef(function Checkbox({ className, label, ...rest }, ref) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--admin-text)]", className)}>
      <input
        ref={ref}
        type="checkbox"
        className="h-4 w-4 cursor-pointer accent-[var(--color-primary)]"
        {...rest}
      />
      {label}
    </label>
  );
});

export default Checkbox;
