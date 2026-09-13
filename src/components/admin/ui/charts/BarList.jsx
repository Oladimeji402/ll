export default function BarList({ items, formatValue = (v) => v, color = "var(--color-primary)" }) {
  if (!items?.length) return null;
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="flex flex-col gap-3.5">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <p className="min-w-0 truncate text-[var(--admin-text)]" title={item.label}>
              {item.label}
            </p>
            <p className="shrink-0 text-[var(--admin-text-muted)]">{formatValue(item.value)}</p>
          </div>
          <div className="h-1.5 w-full bg-[var(--admin-surface-alt)]">
            <div
              className="h-full"
              style={{ width: `${Math.max(4, (item.value / max) * 100)}%`, backgroundColor: color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
