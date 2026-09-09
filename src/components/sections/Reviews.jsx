"use client";

import { useState } from "react";
import Reveal from "@/components/ui/Reveal";
import { siteConfig } from "@/config/site";

export default function Reviews() {
  const { productPage } = siteConfig;
  const reviews = productPage.reviews;
  const [index, setIndex] = useState(0);
  const review = reviews[index];

  function go(delta) {
    setIndex((i) => (i + delta + reviews.length) % reviews.length);
  }

  return (
    <section className="px-5 py-16 sm:py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="font-serif text-3xl text-[var(--color-primary)] sm:text-4xl">
          {productPage.reviewsHeading}
        </h2>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[var(--color-text)]">
          <Stars rating={productPage.reviewsRating} />
          <span>
            {productPage.reviewsRating.toFixed(2)} ({productPage.reviewsCount})
          </span>
          <span className="tracking-nav inline-flex items-center gap-1 text-[10px] uppercase text-[var(--color-text-muted)]">
            <CheckBadge />
            Verified
          </span>
        </div>
      </Reveal>

      <Reveal className="mx-auto mt-10 max-w-xl bg-[var(--color-bg-alt)] px-8 py-10 text-center">
        <span aria-hidden className="font-serif text-4xl text-[var(--color-accent)]">
          &rdquo;
        </span>
        <p className="font-serif text-lg italic text-[var(--color-text)]">{review.text}</p>
        <div className="mt-4 flex justify-center">
          <Stars rating={review.rating} />
        </div>
        <p className="tracking-nav mt-4 text-xs uppercase text-[var(--color-primary)]">
          {review.name}
        </p>
        <p className="tracking-nav mt-2 text-[11px] uppercase text-[var(--color-text-muted)] underline underline-offset-4">
          {review.product}
        </p>
      </Reveal>

      <div className="mt-6 flex justify-center gap-6">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous review"
          className="text-[var(--color-text)] transition-opacity hover:opacity-60"
        >
          &larr;
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next review"
          className="text-[var(--color-text)] transition-opacity hover:opacity-60"
        >
          &rarr;
        </button>
      </div>
    </section>
  );
}

function Stars({ rating }) {
  return (
    <span className="flex text-[var(--color-primary)]">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className="h-4 w-4"
          fill={i < Math.round(rating) ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6L1.3 7.7l6.1-.6L10 1.5Z" strokeLinejoin="round" />
        </svg>
      ))}
    </span>
  );
}

function CheckBadge() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="16" height="16" rx="4" />
      <path d="M6 10l2.5 2.5L14 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
