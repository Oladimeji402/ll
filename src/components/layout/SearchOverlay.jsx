"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import PlaceholderImage from "@/components/ui/PlaceholderImage";

export default function SearchOverlay({ open, onClose, products }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const { recent, addRecent, removeRecent, clearRecent } = useRecentSearches();

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    let cancelled = false;
    const timer = setTimeout(() => {
      fetch(`/api/catalog/products?q=${encodeURIComponent(term)}`)
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) {
            setResults(data);
            setSearching(false);
          }
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  function handleSelect(term) {
    if (term) addRecent(term);
    onClose();
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (query.trim()) addRecent(query.trim());
  }

  const showingResults = query.trim().length > 0;
  const displayProducts = showingResults ? results : products;

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
        <form onSubmit={handleSubmit} className="flex items-center gap-3 border-b border-[var(--color-line)] px-5 py-4">
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            autoFocus={open}
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
        </form>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
          {!showingResults && recent.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <p className="tracking-nav text-[11px] uppercase text-[var(--color-text-muted)]">
                  Recent Searches
                </p>
                <button
                  type="button"
                  onClick={clearRecent}
                  className="text-xs text-[var(--color-text-muted)] underline underline-offset-2 hover:text-[var(--color-text)]"
                >
                  Clear
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {recent.map((term) => (
                  <span
                    key={term}
                    className="flex items-center gap-1.5 rounded-full border border-[var(--color-line)] py-1.5 pl-3 pr-1.5 text-xs text-[var(--color-text)]"
                  >
                    <button type="button" onClick={() => setQuery(term)} className="hover:underline">
                      {term}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeRecent(term)}
                      aria-label={`Remove ${term} from recent searches`}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="tracking-nav text-[11px] uppercase text-[var(--color-text-muted)]">
            {showingResults ? "Results" : "Popular Picks"}
          </p>

          {showingResults && searching && (
            <p className="mt-4 text-sm text-[var(--color-text-muted)]">Searching…</p>
          )}

          {showingResults && !searching && displayProducts.length === 0 && (
            <p className="mt-4 text-sm text-[var(--color-text-muted)]">No results for &quot;{query}&quot;.</p>
          )}

          {displayProducts.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {displayProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={() => handleSelect(query.trim())}
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
          )}
        </div>
      </div>
    </div>
  );
}
