"use client";

import { useId, useState } from "react";

const WIDTH = 640;
const HEIGHT = 240;
const PADDING = { top: 16, right: 12, bottom: 28, left: 12 };

function toPoints(values, max, min) {
  const innerWidth = WIDTH - PADDING.left - PADDING.right;
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const range = max - min || 1;
  const step = values.length > 1 ? innerWidth / (values.length - 1) : 0;
  return values.map((value, i) => ({
    x: PADDING.left + i * step,
    y: PADDING.top + innerHeight - ((value - min) / range) * innerHeight,
  }));
}

export default function LineChart({ data, formatValue = (v) => v, color = "var(--color-primary)", showComparison = true }) {
  const gradientId = useId();
  const [hoverIndex, setHoverIndex] = useState(null);
  if (!data?.length) return null;

  const values = data.map((d) => d.value);
  const prevValues = data.map((d) => d.previousValue ?? 0);
  const allValues = showComparison ? [...values, ...prevValues] : values;
  const max = Math.max(...allValues, 1);
  const min = Math.min(...allValues, 0);

  const points = toPoints(values, max, min);
  const prevPoints = toPoints(prevValues, max, min);
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const prevLinePath = prevPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${HEIGHT - PADDING.bottom} L${points[0].x},${HEIGHT - PADDING.bottom} Z`;

  const labelStep = Math.ceil(data.length / 7);

  function handleMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = ((event.clientX - rect.left) / rect.width) * WIDTH;
    let closest = 0;
    let closestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - relativeX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setHoverIndex(closest);
  }

  const active = hoverIndex != null ? data[hoverIndex] : null;
  const activePoint = hoverIndex != null ? points[hoverIndex] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Sales chart"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={PADDING.left}
            x2={WIDTH - PADDING.right}
            y1={PADDING.top + (HEIGHT - PADDING.top - PADDING.bottom) * f}
            y2={PADDING.top + (HEIGHT - PADDING.top - PADDING.bottom) * f}
            stroke="var(--admin-border)"
            strokeWidth="1"
          />
        ))}

        <path d={areaPath} fill={`url(#${gradientId})`} />
        {showComparison && (
          <path d={prevLinePath} fill="none" stroke="var(--admin-text-muted)" strokeWidth="1.5" strokeDasharray="4 4" />
        )}
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" />

        {activePoint && (
          <>
            <line
              x1={activePoint.x}
              x2={activePoint.x}
              y1={PADDING.top}
              y2={HEIGHT - PADDING.bottom}
              stroke="var(--admin-text-muted)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle cx={activePoint.x} cy={activePoint.y} r="4" fill={color} stroke="var(--admin-surface)" strokeWidth="2" />
          </>
        )}

        {data.map((d, i) =>
          i % labelStep === 0 ? (
            <text
              key={d.label + i}
              x={points[i].x}
              y={HEIGHT - 8}
              fontSize="10"
              textAnchor="middle"
              fill="var(--admin-text-muted)"
            >
              {d.label}
            </text>
          ) : null,
        )}
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2.5 py-1.5 text-xs shadow-md"
          style={{ left: `${(activePoint.x / WIDTH) * 100}%`, top: `${(activePoint.y / HEIGHT) * 100 - 2}%` }}
        >
          <p className="font-medium text-[var(--admin-text)]">{formatValue(active.value)}</p>
          <p className="text-[var(--admin-text-muted)]">{active.label}</p>
        </div>
      )}
    </div>
  );
}
