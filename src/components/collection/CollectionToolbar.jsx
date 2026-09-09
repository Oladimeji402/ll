"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import Reveal from "@/components/ui/Reveal";
import ProductCard from "@/components/ui/ProductCard";

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Most relevant", value: "featured" },
  { label: "Best selling", value: "featured" },
  { label: "Alphabetically, A-Z", value: "name-asc" },
  { label: "Alphabetically, Z-A", value: "name-desc" },
  { label: "Price, low to high", value: "price-asc" },
  { label: "Price, high to low", value: "price-desc" },
  { label: "Date, old to new", value: "featured" },
  { label: "Date, new to old", value: "reverse" },
];

function sortProducts(products, sortValue) {
  const list = [...products];
  switch (sortValue) {
    case "name-asc":
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return list.sort((a, b) => b.name.localeCompare(a.name));
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "reverse":
      return list.reverse();
    default:
      return list;
  }
}

export default function CollectionToolbar({ products, refineOptions }) {
  const [refineOpen, setRefineOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortLabel, setSortLabel] = useState(SORT_OPTIONS[0].label);
  const [sortValue, setSortValue] = useState(SORT_OPTIONS[0].value);
  const [dense, setDense] = useState(false);
  const toolbarRef = useRef(null);

  const sorted = useMemo(() => sortProducts(products, sortValue), [products, sortValue]);

  useEffect(() => {
    if (!refineOpen && !sortOpen) return;

    function handlePointerDown(e) {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
        setRefineOpen(false);
        setSortOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [refineOpen, sortOpen]);

  return (
    <section className="mx-auto max-w-7xl px-5 pb-16 sm:pb-20">
      <div
        ref={toolbarRef}
        className="relative flex flex-wrap items-center justify-between gap-4 border-y border-[var(--color-line)] py-4"
      >
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setRefineOpen((v) => !v);
              setSortOpen(false);
            }}
            aria-expanded={refineOpen}
            className="tracking-nav -m-2 flex cursor-pointer items-center gap-2 p-2 text-xs uppercase text-[var(--color-text)]"
          >
            Refine
            <Chevron open={refineOpen} />
          </button>

          <div
            className={cn(
              "absolute left-0 top-full z-20 mt-3 w-64 origin-top border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-lg transition-all duration-200 ease-out",
              refineOpen
                ? "pointer-events-auto scale-y-100 opacity-100"
                : "pointer-events-none scale-y-95 opacity-0",
            )}
          >
            <ul className="flex flex-col gap-3">
              {refineOptions.map((option) => (
                <li key={option}>
                  <label className="flex items-center gap-3 text-sm text-[var(--color-text)]">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[var(--color-primary)]"
                    />
                    {option}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <span className="tracking-nav text-xs uppercase text-[var(--color-text-muted)]">
            {sorted.length} Items
          </span>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setSortOpen((v) => !v);
                setRefineOpen(false);
              }}
              aria-expanded={sortOpen}
              className="tracking-nav -m-2 flex cursor-pointer items-center gap-2 p-2 text-xs uppercase text-[var(--color-text)]"
            >
              Sort
              <Chevron open={sortOpen} />
            </button>

            <div
              className={cn(
                "absolute right-0 top-full z-20 mt-3 w-56 origin-top border border-[var(--color-line)] bg-[var(--color-surface)] py-2 shadow-lg transition-all duration-200 ease-out",
                sortOpen
                  ? "pointer-events-auto scale-y-100 opacity-100"
                  : "pointer-events-none scale-y-95 opacity-0",
              )}
            >
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => {
                    setSortLabel(option.label);
                    setSortValue(option.value);
                    setSortOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg-alt)]"
                >
                  <span className={cn("w-4", sortLabel !== option.label && "invisible")}>&#10003;</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => setDense(false)}
              aria-label="Comfortable grid view"
              aria-pressed={!dense}
              className={cn(
                "flex h-8 w-8 cursor-pointer items-center justify-center border border-[var(--color-line)] transition-colors",
                !dense ? "border-[var(--color-text)] text-[var(--color-text)]" : "text-[var(--color-text-muted)]",
              )}
            >
              <GridIcon dense={false} />
            </button>
            <button
              type="button"
              onClick={() => setDense(true)}
              aria-label="Compact grid view"
              aria-pressed={dense}
              className={cn(
                "flex h-8 w-8 cursor-pointer items-center justify-center border border-[var(--color-line)] transition-colors",
                dense ? "border-[var(--color-text)] text-[var(--color-text)]" : "text-[var(--color-text-muted)]",
              )}
            >
              <GridIcon dense />
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6",
          dense ? "sm:grid-cols-6" : "sm:grid-cols-4",
        )}
      >
        {sorted.map((product, i) => (
          <Reveal key={product.id} delay={(i % 4) * 90}>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Chevron({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-3 w-3 transition-transform duration-300 ease-out", open && "rotate-180")}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GridIcon({ dense }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      {dense ? (
        <>
          <rect x="2" y="2" width="4" height="4" />
          <rect x="10" y="2" width="4" height="4" />
          <rect x="18" y="2" width="4" height="4" />
          <rect x="2" y="10" width="4" height="4" />
          <rect x="10" y="10" width="4" height="4" />
          <rect x="18" y="10" width="4" height="4" />
          <rect x="2" y="18" width="4" height="4" />
          <rect x="10" y="18" width="4" height="4" />
          <rect x="18" y="18" width="4" height="4" />
        </>
      ) : (
        <>
          <rect x="2" y="2" width="9" height="9" />
          <rect x="13" y="2" width="9" height="9" />
          <rect x="2" y="13" width="9" height="9" />
          <rect x="13" y="13" width="9" height="9" />
        </>
      )}
    </svg>
  );
}
