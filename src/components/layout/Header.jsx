"use client";

import { useState } from "react";
import Link from "next/link";
import { cn, slugify } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useMounted } from "@/hooks/useMounted";
import { getAllProducts } from "@/data/products";
import { useCartStore, useCartCount } from "@/lib/store/cart-store";
import MobileMenu from "./MobileMenu";
import SearchOverlay from "./SearchOverlay";
import CartDrawer from "./CartDrawer";
import AccountModal from "./AccountModal";

const searchPicks = getAllProducts().slice(0, 4);

export default function Header() {
  const { scrolled } = useScrollPosition(40);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const cartOpen = useCartStore((s) => s.open);
  const openCart = useCartStore((s) => s.openCart);
  const closeCart = useCartStore((s) => s.closeCart);
  const cartCount = useCartCount();
  const mounted = useMounted();

  return (
    <>
      <header
        className={cn(
          "header-shell sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-bg)]",
          scrolled && "shadow-[0_4px_16px_rgba(0,0,0,0.06)]",
        )}
      >
        <div
          className={cn(
            "relative mx-auto flex max-w-7xl items-center px-5 transition-[padding] duration-300",
            scrolled ? "pt-3 pb-1" : "pt-5 pb-2",
          )}
        >
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="-m-2 flex cursor-pointer flex-col gap-[5px] p-2 md:hidden"
          >
            <span className="h-px w-6 bg-[var(--color-text)]" />
            <span className="h-px w-6 bg-[var(--color-text)]" />
            <span className="h-px w-4 bg-[var(--color-text)]" />
          </button>

          <Link
            href="/"
            className={cn(
              "font-serif absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap tracking-[0.02em] text-[var(--color-primary)] transition-[font-size] duration-300 sm:gap-3 sm:tracking-[0.2em]",
              scrolled ? "text-sm sm:text-2xl" : "text-base sm:text-3xl md:text-4xl",
            )}
          >
            <span aria-hidden className="hidden h-[0.7em] w-px bg-[var(--color-primary)] sm:block" />
            {siteConfig.brandName}
          </Link>

          <div className="ml-auto flex items-center gap-2 text-[var(--color-text)] sm:gap-4">
            <IconButton label="Search" onClick={() => setSearchOpen(true)}>
              <SearchIcon />
            </IconButton>
            <IconButton
              label="Account"
              className="hidden md:inline-flex"
              onClick={() => setAccountOpen(true)}
            >
              <UserIcon />
            </IconButton>
            <IconButton label="Bag" onClick={openCart} className="relative">
              <BagIcon />
              {mounted && cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[9px] font-medium text-[var(--color-on-primary)]">
                  {cartCount}
                </span>
              )}
            </IconButton>
          </div>
        </div>

        <nav className="hidden justify-center gap-7 px-5 pb-3 md:flex">
          {siteConfig.navLinks.map((link) => (
            <Link
              key={link}
              href={`/collections/${slugify(link)}`}
              className="tracking-nav whitespace-nowrap text-[11px] uppercase text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-dark)]"
            >
              {link}
            </Link>
          ))}
        </nav>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} products={searchPicks} />
      <CartDrawer open={cartOpen} onClose={closeCart} />
      <AccountModal open={accountOpen} onClose={() => setAccountOpen(false)} />
    </>
  );
}

function IconButton({ children, label, className, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "-m-1.5 inline-flex cursor-pointer items-center justify-center p-1.5 sm:-m-2 sm:p-2",
        className,
      )}
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
