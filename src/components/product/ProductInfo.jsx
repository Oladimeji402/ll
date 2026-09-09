"use client";

import { useState } from "react";
import { formatPrice } from "@/data/products";
import { siteConfig } from "@/config/site";
import Accordion from "@/components/ui/Accordion";
import { cn } from "@/lib/utils";

export default function ProductInfo({ product }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const { productPage } = siteConfig;

  return (
    <div className="flex flex-col px-6 py-10 lg:px-16 lg:py-16">
      <h1 className="font-serif text-4xl leading-tight text-[var(--color-primary)] sm:text-5xl">
        {product.name}
      </h1>

      <div className="mt-5">
        <p className="text-xl text-[var(--color-text)]">
          {product.originalPrice ? (
            <span className="mr-3 text-[var(--color-text-muted)] line-through">
              {formatPrice(product.originalPrice)}
            </span>
          ) : null}
          {formatPrice(product.price)}
        </p>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {productPage.shippingNote}
        </p>
      </div>

      <div className="mt-8 border-t border-[var(--color-line)]" />

      <div className="mt-8">
        <p className="tracking-nav text-xs uppercase text-[var(--color-text)]">Size</p>
        <div className="mt-3 flex gap-3">
          {product.sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              aria-pressed={selectedSize === size}
              className={cn(
                "flex h-11 w-11 items-center justify-center border text-sm transition-colors",
                selectedSize === size
                  ? "border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-surface)]"
                  : "border-[var(--color-line)] text-[var(--color-text)] hover:border-[var(--color-text)]",
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="tracking-nav flex flex-1 items-center justify-center gap-2 border border-[var(--color-primary)] px-6 py-4 text-xs uppercase text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-[var(--color-on-primary)]"
        >
          <CartIcon />
          {productPage.addToCartLabel}
        </button>
        <button
          type="button"
          className="tracking-nav flex-1 bg-[var(--color-primary)] px-6 py-4 text-xs uppercase text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-dark)]"
        >
          {productPage.buyNowLabel}
        </button>
      </div>

      <Accordion items={productPage.accordion} className="mt-10" />
    </div>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 8h12l-1 13H7L6 8Z" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
    </svg>
  );
}
