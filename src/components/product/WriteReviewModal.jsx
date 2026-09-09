"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import PlaceholderImage from "@/components/ui/PlaceholderImage";

export default function WriteReviewModal({ open, onClose, product }) {
  const [step, setStep] = useState("rate");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [contentVisible, setContentVisible] = useState(true);
  const contentRef = useRef(null);
  const [height, setHeight] = useState("auto");

  useLayoutEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [step, open]);

  function reset() {
    setStep("rate");
    setRating(0);
    setHoverRating(0);
    setContentVisible(true);
  }

  function handleClose() {
    onClose();
    setTimeout(reset, 300);
  }

  function selectRating(value) {
    setRating(value);
    setContentVisible(false);
    setTimeout(() => {
      setStep("form");
      setContentVisible(true);
    }, 180);
  }

  const { writeReviewLabel, writeReviewForm } = siteConfig.productPage.customerReviews;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-5 transition-opacity duration-300",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={handleClose}
        className="absolute inset-0 bg-black/40"
      />

      <div
        className={cn(
          "relative w-full max-w-md bg-[var(--color-surface)] shadow-xl transition-all duration-300",
          open ? "scale-100 opacity-100" : "scale-95 opacity-0",
        )}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 text-xl leading-none text-[var(--color-text-muted)]"
        >
          &times;
        </button>

        <div
          className="overflow-hidden transition-[height] duration-300 ease-out"
          style={{ height }}
        >
          <div
            ref={contentRef}
            className={cn(
              "px-8 py-10 transition-opacity duration-150",
              contentVisible ? "opacity-100" : "opacity-0",
            )}
          >
            <p className="font-serif text-center text-2xl tracking-[0.15em] text-[var(--color-primary)]">
              {siteConfig.brandName}
            </p>

            {product ? (
              <div className="mt-6 flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden">
                  <PlaceholderImage tone={product.tone} alt={product.name} />
                </div>
                <p className="tracking-nav text-sm uppercase text-[var(--color-text)]">
                  {product.name}
                </p>
              </div>
            ) : null}

            {step === "rate" ? (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: 5 }, (_, i) => {
                  const value = i + 1;
                  const filled = value <= (hoverRating || rating);
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
                      onMouseEnter={() => setHoverRating(value)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => selectRating(value)}
                      className="p-1"
                    >
                      <StarIcon filled={filled} />
                    </button>
                  );
                })}
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); handleClose(); }} className="mt-6 flex flex-col gap-6">
                <div className="flex justify-center gap-2">
                  {Array.from({ length: 5 }, (_, i) => {
                    const value = i + 1;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
                        onClick={() => setRating(value)}
                        className="p-1"
                      >
                        <StarIcon filled={value <= rating} />
                      </button>
                    );
                  })}
                </div>

                <label className="block">
                  <span className="text-sm text-[var(--color-text)]">
                    {writeReviewForm.emailLabel} <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="email"
                    required
                    placeholder={writeReviewForm.emailPlaceholder}
                    className="mt-2 w-full border border-[var(--color-line)] bg-transparent px-4 py-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
                  />
                </label>

                <label className="block">
                  <span className="text-sm text-[var(--color-text)]">
                    {writeReviewForm.nameLabel} <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    required
                    placeholder={writeReviewForm.namePlaceholder}
                    className="mt-2 w-full border border-[var(--color-line)] bg-transparent px-4 py-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
                  />
                </label>

                <label className="block">
                  <span className="text-sm text-[var(--color-text)]">
                    {writeReviewForm.reviewLabel} <span className="text-red-500">*</span>
                  </span>
                  <textarea
                    required
                    rows={4}
                    placeholder={writeReviewForm.reviewPlaceholder}
                    className="mt-2 w-full resize-y border border-[var(--color-line)] bg-transparent px-4 py-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
                  />
                </label>

                <div>
                  <span className="text-sm text-[var(--color-text)]">{writeReviewForm.mediaLabel}</span>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">{writeReviewForm.mediaHint}</p>
                  <button
                    type="button"
                    className="mt-3 flex h-16 w-16 items-center justify-center border border-dashed border-[var(--color-line)] text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-text)]"
                  >
                    <UploadIcon />
                  </button>
                </div>

                <button
                  type="submit"
                  className="tracking-nav bg-[var(--color-primary)] py-3 text-xs uppercase text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-dark)]"
                >
                  {writeReviewForm.doneLabel}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StarIcon({ filled }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-8 w-8 text-[var(--color-primary)] transition-colors duration-150"
      style={{ fill: filled ? "var(--color-primary)" : "none" }}
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 16V4M8 8l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
