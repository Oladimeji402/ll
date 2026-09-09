"use client";

import { useRef } from "react";
import Reveal from "@/components/ui/Reveal";
import ProductCard from "@/components/ui/ProductCard";
import { siteConfig } from "@/config/site";

export default function TrendingStyles({ products }) {
  const trackRef = useRef(null);

  function scrollByCards(direction) {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = track.firstElementChild?.offsetWidth ?? 280;
    track.scrollBy({ left: direction * (cardWidth + 24), behavior: "smooth" });
  }

  return (
    <section className="py-14 sm:py-20">
      <Reveal className="mb-10 flex items-center justify-between px-5 sm:mx-auto sm:max-w-7xl">
        <h2 className="font-serif text-3xl text-[var(--color-primary)] sm:text-4xl">
          {siteConfig.trending.heading}
        </h2>
        <div className="hidden gap-3 sm:flex">
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            aria-label="Scroll left"
            className="flex h-9 w-9 items-center justify-center border border-[var(--color-line)] text-[var(--color-text)] transition-colors hover:border-[var(--color-text)]"
          >
            &larr;
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            aria-label="Scroll right"
            className="flex h-9 w-9 items-center justify-center border border-[var(--color-line)] text-[var(--color-text)] transition-colors hover:border-[var(--color-text)]"
          >
            &rarr;
          </button>
        </div>
      </Reveal>

      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-2 sm:mx-auto sm:max-w-7xl"
      >
        {products.map((product) => (
          <div key={product.id} className="w-[65vw] shrink-0 snap-start sm:w-[calc((100%-3*24px)/4)]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
