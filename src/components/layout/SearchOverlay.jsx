"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/data/products";
import PlaceholderImage from "@/components/ui/PlaceholderImage";

export default function SearchOverlay({ open, onClose, products }) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-opacity duration-300",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />

      <div
        className={cn(
          "absolute left-1/2 top-24 w-[92%] max-w-2xl -translate-x-1/2 bg-[var(--color-surface)] shadow-xl transition-all duration-300",
          open ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0",
        )}
      >
        <div className="flex items-center gap-3 border-b border-[var(--color-line)] px-5 py-4">
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="text-xl leading-none text-[var(--color-text-muted)]"
          >
            &times;
          </button>
        </div>

        <div className="px-5 py-5">
          <p className="tracking-nav text-[11px] uppercase text-[var(--color-text-muted)]">
            Popular Picks
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                onClick={onClose}
                className="group block"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-image-bg)]">
                  <PlaceholderImage
                    tone={product.tone}
                    alt={product.name}
                    zoomOnHover
                    className="transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
                <p className="tracking-nav mt-2 text-[10px] uppercase text-[var(--color-text)]">
                  {product.name}
                </p>
                <p className="text-xs text-[var(--color-primary)]">{formatPrice(product.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
