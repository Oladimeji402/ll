"use client";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export default function MobileMenu({ open, onClose }) {
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
          "absolute right-0 top-0 h-full w-[82%] max-w-sm bg-[var(--color-bg)] shadow-xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-line)] px-6 py-5">
          <span className="font-serif text-lg text-[var(--color-primary)]">
            Menu
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="text-2xl leading-none text-[var(--color-text)]"
          >
            &times;
          </button>
        </div>

        <nav className="flex flex-col px-6 py-6">
          {siteConfig.navLinks.map((link) => (
            <a
              key={link}
              href="#"
              onClick={onClose}
              className="tracking-nav border-b border-[var(--color-line)] py-4 text-xs uppercase text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-dark)]"
            >
              {link}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
