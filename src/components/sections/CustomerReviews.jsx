"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Reveal from "@/components/ui/Reveal";
import WriteReviewModal from "@/components/product/WriteReviewModal";
import { siteConfig } from "@/config/site";

export default function CustomerReviews({ product, reviews }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { heading, writeReviewLabel, searchPlaceholder, sortLabel, filterLabel, mediaFilterLabel, emptyStateText } =
    siteConfig.productPage.customerReviews;

  const { reviews: items, count, average, breakdown } = reviews;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (r) => r.body.toLowerCase().includes(q) || r.authorName.toLowerCase().includes(q),
    );
  }, [items, query]);

  function handleSubmitted() {
    setModalOpen(false);
    router.refresh();
  }

  return (
    <section className="mx-auto max-w-4xl px-5 py-16 sm:py-20">
      <Reveal>
        <h2 className="font-serif text-2xl text-[var(--color-primary)] sm:text-3xl">
          {heading}
        </h2>
        <div className="mt-4 border-t border-[var(--color-line)]" />
      </Reveal>

      <Reveal className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-center">
        <div className="flex shrink-0 items-center gap-4">
          <span className="font-serif text-5xl text-[var(--color-text)]">
            {average}
            <span className="text-2xl text-[var(--color-text-muted)]">/5</span>
          </span>
          <div>
            <Stars rating={average} />
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {count} review{count === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {breakdown.map((row) => (
            <div key={row.stars} className="flex items-center gap-3 text-sm text-[var(--color-text)]">
              <span className="w-8 shrink-0">{row.stars}★</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-line)]">
                <span
                  className="block h-full rounded-full bg-[var(--color-primary)]"
                  style={{ width: `${row.percent}%` }}
                />
              </span>
              <span className="w-10 shrink-0 text-right text-[var(--color-text-muted)]">
                {row.percent}%
              </span>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal className="mt-10 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-line)] pb-4">
        <div>
          <span className="font-serif text-xl text-[var(--color-text)]">Reviews</span>
          <span className="ml-2 text-[var(--color-text-muted)]">{count}</span>
          <span aria-hidden className="mt-2 block h-0.5 w-10 bg-[var(--color-primary)]" />
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="tracking-nav bg-[var(--color-primary)] px-5 py-2.5 text-xs uppercase text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-dark)]"
        >
          {writeReviewLabel}
        </button>
      </Reveal>

      <Reveal className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="min-w-[180px] flex-1 rounded-full border border-[var(--color-line)] bg-[var(--color-bg-alt)] px-4 py-2 text-sm outline-none placeholder:text-[var(--color-text-muted)]"
        />
        <span className="tracking-nav rounded-full border border-[var(--color-line)] bg-[var(--color-bg-alt)] px-4 py-2 text-xs uppercase text-[var(--color-text-muted)]">
          {sortLabel}
        </span>
        <span className="tracking-nav rounded-full border border-[var(--color-line)] bg-[var(--color-bg-alt)] px-4 py-2 text-xs uppercase text-[var(--color-text-muted)]">
          {filterLabel}
        </span>
        <span className="tracking-nav rounded-full border border-[var(--color-line)] bg-[var(--color-bg-alt)] px-4 py-2 text-xs uppercase text-[var(--color-text-muted)]">
          {mediaFilterLabel}
        </span>
      </Reveal>

      {filtered.length === 0 ? (
        <Reveal className="mt-10 py-6 text-center text-sm text-[var(--color-text-muted)]">
          {count === 0 ? emptyStateText : "No reviews match your search."}
        </Reveal>
      ) : (
        <ul className="mt-8 flex flex-col divide-y divide-[var(--color-line)]">
          {filtered.map((review) => (
            <li key={review.id} className="py-6">
              <div className="flex items-center justify-between gap-4">
                <Stars rating={review.rating} />
                <span className="text-xs text-[var(--color-text-muted)]">
                  {new Date(review.createdAt).toLocaleDateString("en-NG", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text)]">{review.body}</p>
              <p className="mt-2 tracking-nav text-xs uppercase text-[var(--color-text-muted)]">
                {review.authorName}
              </p>
            </li>
          ))}
        </ul>
      )}

      <WriteReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmitted={handleSubmitted}
        product={product}
      />
    </section>
  );
}

function Stars({ rating }) {
  return (
    <span className="flex">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className="h-4 w-4 text-[var(--color-line)]"
          style={{ fill: i < Math.round(rating) ? "var(--color-primary)" : "none" }}
          stroke="currentColor"
          strokeWidth="1"
        >
          <path
            d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6L1.3 7.7l6.1-.6L10 1.5Z"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </span>
  );
}
