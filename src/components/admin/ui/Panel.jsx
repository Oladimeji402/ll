import { cn } from "@/lib/utils";

export default function Panel({ className, children, padded = true }) {
  return (
    <section
      className={cn(
        "border border-[var(--admin-border)] bg-[var(--admin-surface)]",
        padded && "p-5 sm:p-6",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PanelHeader({ title, description, actions, className }) {
  return (
    <div className={cn("mb-5 flex flex-wrap items-start justify-between gap-3", className)}>
      <div>
        <h2 className="font-serif text-lg text-[var(--admin-text)]">{title}</h2>
        {description && <p className="mt-1 text-sm text-[var(--admin-text-muted)]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
