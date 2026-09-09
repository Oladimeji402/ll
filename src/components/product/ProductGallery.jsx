"use client";

import { useState } from "react";
import PlaceholderImage from "@/components/ui/PlaceholderImage";

export default function ProductGallery({ product }) {
  const total = product.images ?? 4;
  const [index, setIndex] = useState(0);

  function go(delta) {
    setIndex((i) => (i + delta + total) % total);
  }

  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--color-image-bg)] lg:aspect-auto lg:h-full">
      <PlaceholderImage
        tone={product.tone}
        alt={`${product.name} — photo ${index + 1}`}
        variant={index % 2 === 0 ? "front" : "side"}
      />

      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous photo"
        className="absolute left-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-[var(--color-text)] transition-opacity hover:opacity-60"
      >
        <ArrowIcon direction="left" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next photo"
        className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-[var(--color-text)] transition-opacity hover:opacity-60"
      >
        <ArrowIcon direction="right" />
      </button>

      <span className="tracking-nav absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-surface)]/80 px-3 py-1 text-[11px] text-[var(--color-text)]">
        {index + 1} / {total}
      </span>
    </div>
  );
}

function ArrowIcon({ direction }) {
  const d = direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7";
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
