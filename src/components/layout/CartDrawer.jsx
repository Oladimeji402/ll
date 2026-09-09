"use client";

import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

export default function CartDrawer({ open, onClose }) {
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
          "absolute right-0 top-0 flex h-full w-[88%] max-w-md flex-col bg-[var(--color-bg)] shadow-xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-line)] px-6 py-5">
          <span className="font-serif text-lg text-[var(--color-primary)]">Your Bag</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close bag"
            className="text-2xl leading-none text-[var(--color-text)]"
          >
            &times;
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <svg viewBox="0 0 24 24" className="h-10 w-10 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M6 8h12l-1 13H7L6 8Z" strokeLinejoin="round" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
          </svg>
          <p className="text-sm text-[var(--color-text-muted)]">Your bag is empty.</p>
          <Button as="button" type="button" onClick={onClose} variant="outline">
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
