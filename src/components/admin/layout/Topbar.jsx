"use client";

import { useEffect, useState } from "react";
import { Menu, Search } from "lucide-react";
import NotificationsDropdown from "./NotificationsDropdown";
import UserMenu from "./UserMenu";

export default function Topbar({ onOpenMobileNav, onOpenSearch }) {
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPod|iPad/.test(window.navigator.platform ?? window.navigator.userAgent));
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/95 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Open navigation menu"
        className="flex h-9 w-9 items-center justify-center text-[var(--admin-text)] lg:hidden"
      >
        <Menu className="h-5 w-5" strokeWidth={1.75} />
      </button>

      <p className="font-serif text-base text-[var(--admin-text)] lg:hidden">LL Collectives</p>

      <button
        type="button"
        onClick={onOpenSearch}
        className="ml-auto flex h-9 min-w-0 flex-1 items-center gap-2 border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-sm text-[var(--admin-text-muted)] hover:border-[var(--admin-text)]/30 sm:ml-0 sm:max-w-xs"
        aria-label="Open search"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden truncate sm:inline">Search products, orders, customers…</span>
        <span className="ml-auto hidden shrink-0 items-center gap-0.5 border border-[var(--admin-border)] px-1.5 py-0.5 text-[10px] sm:flex">
          {isMac ? "⌘" : "Ctrl"}K
        </span>
      </button>

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <NotificationsDropdown />
        <div className="hidden sm:block">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
