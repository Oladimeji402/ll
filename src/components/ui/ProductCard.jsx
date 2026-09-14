"use client";

import Link from "next/link";
import PlaceholderImage from "./PlaceholderImage";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart-store";

export default function ProductCard({ product, theme = "light" }) {
  const isDark = theme === "dark";
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  function handleQuickAdd(event) {
    event.preventDefault();
    event.stopPropagation();
    addItem(product, product.sizes[0], 1);
    openCart();
  }

  // Rendered as `role="button"` spans (not <button>) because these sit
  // inside the card's <Link> — nesting a real button in an anchor is
  // invalid HTML and browsers will silently break the layout.
  function handleQuickAddKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      handleQuickAdd(event);
    }
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-image-bg)]">
        {/* Default: front-facing shot */}
        <PlaceholderImage
          tone={product.tone}
          alt={product.name}
          variant="front"
          fill
          className="opacity-100 transition-opacity duration-500 ease-out group-hover:opacity-0"
        />
        {/* Revealed on hover: side-profile shot */}
        <PlaceholderImage
          tone={product.tone}
          alt={`${product.name} — side view`}
          variant="side"
          fill
          className="opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
        />

        {/* Desktop: full-width bar revealed on hover */}
        <span
          role="button"
          tabIndex={0}
          onClick={handleQuickAdd}
          onKeyDown={handleQuickAddKeyDown}
          aria-label={`Quick add ${product.name}`}
          className={cn(
            "absolute inset-x-0 bottom-0 hidden translate-y-full cursor-pointer py-3 text-center transition-transform duration-300 ease-out group-hover:translate-y-0 md:block",
            isDark ? "bg-[var(--color-surface)]" : "bg-[var(--color-primary)]",
          )}
        >
          <span
            className={cn(
              "tracking-nav text-[11px] uppercase",
              isDark ? "text-[var(--color-primary)]" : "text-[var(--color-on-primary)]",
            )}
          >
            Quick Add
          </span>
        </span>

        {/* Mobile: no reliable hover, so show a persistent quick-add button instead */}
        <span
          role="button"
          tabIndex={0}
          onClick={handleQuickAdd}
          onKeyDown={handleQuickAddKeyDown}
          aria-label={`Quick add ${product.name}`}
          className="absolute bottom-3 right-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] md:hidden"
        >
          <BagPlusIcon />
        </span>
      </div>

      <div className="pt-4 text-center">
        <p
          className={cn(
            "tracking-nav text-[11px] uppercase",
            isDark ? "text-[var(--color-on-primary)]" : "text-[var(--color-text)]",
          )}
        >
          {product.name}
        </p>
        <p
          className={cn(
            "mt-1 inline-block px-2 py-0.5 text-sm transition-colors duration-300",
            isDark
              ? "text-[var(--color-accent)] group-hover:bg-[var(--color-surface)] group-hover:text-[var(--color-primary)]"
              : "text-[var(--color-primary)]",
          )}
        >
          {product.originalPrice ? (
            <span
              className={cn(
                "mr-2 line-through",
                isDark ? "text-[var(--color-on-primary)]/60 group-hover:text-[var(--color-text-muted)]" : "text-[var(--color-text-muted)]",
              )}
            >
              {formatPrice(product.originalPrice)}
            </span>
          ) : null}
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}

function BagPlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 8h12l-1 13H7L6 8Z" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
      <path d="M12 12v4M10 14h4" strokeLinecap="round" />
    </svg>
  );
}
