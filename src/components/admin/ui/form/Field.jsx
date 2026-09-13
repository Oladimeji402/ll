import { cn } from "@/lib/utils";

export default function Field({ label, htmlFor, hint, error, required, className, children }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-[var(--admin-text)]">
          {label} {required && <span className="text-[var(--admin-danger)]">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-[var(--admin-text-muted)]">{hint}</p>}
      {error && (
        <p className="text-xs text-[var(--admin-danger)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
