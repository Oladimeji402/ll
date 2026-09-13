import { cn } from "@/lib/utils";

export default function Skeleton({ className }) {
  return <div className={cn("admin-skeleton rounded-sm", className)} />;
}

export function SkeletonRows({ rows = 5, cols = 4 }) {
  return (
    <div className="divide-y divide-[var(--admin-border)]">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-4">
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton key={c} className={cn("h-4", c === 0 ? "w-1/4" : "flex-1 max-w-[140px]")} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonCards({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="mt-4 h-7 w-2/3" />
          <Skeleton className="mt-3 h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}
