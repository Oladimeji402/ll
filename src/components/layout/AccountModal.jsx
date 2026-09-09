"use client";

import { cn } from "@/lib/utils";

export default function AccountModal({ open, onClose }) {
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
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <div
        className={cn(
          "relative w-full max-w-sm bg-[var(--color-surface)] p-8 shadow-xl transition-all duration-300",
          open ? "scale-100 opacity-100" : "scale-95 opacity-0",
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-xl leading-none text-[var(--color-text-muted)]"
        >
          &times;
        </button>

        <h2 className="font-serif text-2xl text-[var(--color-primary)]">Account</h2>

        <button
          type="button"
          className="tracking-nav mt-6 w-full bg-[var(--color-primary)] py-3 text-xs uppercase text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-dark)]"
        >
          Sign In
        </button>
        <button
          type="button"
          className="tracking-nav mt-3 w-full border border-[var(--color-text)] py-3 text-xs uppercase text-[var(--color-text)] transition-colors hover:bg-[var(--color-text)] hover:text-[var(--color-surface)]"
        >
          Create Account
        </button>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="tracking-nav border border-[var(--color-line)] py-3 text-[10px] uppercase text-[var(--color-text-muted)]"
          >
            Orders
          </button>
          <button
            type="button"
            className="tracking-nav border border-[var(--color-line)] py-3 text-[10px] uppercase text-[var(--color-text-muted)]"
          >
            Profile
          </button>
        </div>
      </div>
    </div>
  );
}
