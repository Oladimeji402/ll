import { cn } from "@/lib/utils";

/**
 * Pure-CSS hover tooltip (group/group-hover) — used for sidebar labels
 * when collapsed. Not focus-visible aware beyond the browser's native
 * :hover, which is fine here since the parent link/button already carries
 * its own accessible name via aria-label.
 */
export default function Tooltip({ label, children, className }) {
  return (
    <span className={cn("group/tooltip relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap bg-[var(--admin-text)] px-2.5 py-1.5 text-xs text-[var(--admin-bg)] opacity-0 shadow-md transition-opacity duration-150 group-hover/tooltip:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
