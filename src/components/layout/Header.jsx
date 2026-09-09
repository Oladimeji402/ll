"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const { scrolled, direction } = useScrollPosition(40);
  const [menuOpen, setMenuOpen] = useState(false);

  const visibleLinks = siteConfig.navLinks.slice(0, siteConfig.navVisibleCount);
  const overflowLinks = siteConfig.navLinks.slice(siteConfig.navVisibleCount);

  return (
    <>
      <header
        className={cn(
          "header-shell sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-bg)]",
          scrolled && "shadow-[0_4px_16px_rgba(0,0,0,0.06)]",
          direction === "down" && scrolled ? "-translate-y-full" : "translate-y-0",
        )}
      >
        <div
          className={cn(
            "mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-5 transition-[padding] duration-300",
            scrolled ? "py-3" : "py-5",
          )}
        >
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="flex flex-col gap-[5px] justify-self-start md:hidden"
          >
            <span className="h-px w-6 bg-[var(--color-text)]" />
            <span className="h-px w-6 bg-[var(--color-text)]" />
            <span className="h-px w-4 bg-[var(--color-text)]" />
          </button>

          <Link
            href="/"
            className={cn(
              "font-serif flex items-center gap-3 justify-self-center tracking-[0.2em] text-[var(--color-primary)] transition-[font-size] duration-300",
              scrolled ? "text-2xl" : "text-3xl md:text-4xl",
            )}
          >
            <span aria-hidden className="h-[0.7em] w-px bg-[var(--color-primary)]" />
            {siteConfig.brandName}
          </Link>

          <div className="flex items-center justify-self-end gap-4 text-[var(--color-text)]">
            <IconButton label="Search">
              <SearchIcon />
            </IconButton>
            <IconButton label="Account" className="hidden md:inline-flex">
              <UserIcon />
            </IconButton>
            <IconButton label="Bag">
              <BagIcon />
            </IconButton>
          </div>
        </div>

        <nav className="hidden justify-center gap-7 px-5 py-3 md:flex">
          {visibleLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="tracking-nav whitespace-nowrap text-[11px] uppercase text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-dark)]"
            >
              {link}
            </a>
          ))}
          {overflowLinks.length > 0 ? (
            <div className="group relative">
              <button className="tracking-nav whitespace-nowrap text-[11px] uppercase text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-dark)]">
                {siteConfig.navOverflowLabel}
              </button>
              <div className="invisible absolute left-1/2 top-full z-10 w-48 -translate-x-1/2 translate-y-1 border border-[var(--color-line)] bg-[var(--color-surface)] py-2 opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:translate-y-2 group-hover:opacity-100">
                {overflowLinks.map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="tracking-nav block px-4 py-2 text-center text-[11px] uppercase text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </nav>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

function IconButton({ children, label, className }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn("inline-flex items-center justify-center", className)}
    >
      {children}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6" strokeLinecap="round" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 8h12l-1 13H7L6 8Z" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
    </svg>
  );
}
