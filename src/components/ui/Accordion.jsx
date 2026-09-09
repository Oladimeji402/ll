"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Accordion({ items, className, topBorder = true }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className={cn(topBorder && "border-t border-[var(--color-line)]", className)}>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.heading ?? item.question} className="border-b border-[var(--color-line)]">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="tracking-nav flex w-full items-center justify-between py-4 text-left text-xs uppercase text-[var(--color-text)]"
            >
              {item.heading ?? item.question}
              <svg
                viewBox="0 0 24 24"
                className={cn(
                  "h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform duration-300",
                  isOpen && "rotate-45",
                )}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </button>
            <div
              className={cn(
                "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="min-h-0">
                <p className="pb-4 text-sm normal-case leading-relaxed text-[var(--color-text-muted)]">
                  {item.body ?? item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
