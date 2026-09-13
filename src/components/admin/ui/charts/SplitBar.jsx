export default function SplitBar({ segments }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden bg-[var(--admin-surface-alt)]">
        {segments.map((segment) => (
          <div
            key={segment.label}
            style={{ width: `${(segment.value / total) * 100}%`, backgroundColor: segment.color }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-4">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-1.5 text-xs text-[var(--admin-text-muted)]">
            <span className="h-2 w-2 shrink-0" style={{ backgroundColor: segment.color }} />
            {segment.label} <span className="text-[var(--admin-text)]">{segment.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
