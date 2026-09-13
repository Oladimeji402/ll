"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Package, ShoppingBag, Users, Layers, CornerDownLeft } from "lucide-react";
import Overlay from "../ui/Overlay";
import { globalSearch } from "@/lib/admin/services/search-service";

const GROUPS = [
  { key: "products", label: "Products", icon: Package },
  { key: "orders", label: "Orders", icon: ShoppingBag },
  { key: "customers", label: "Customers", icon: Users },
  { key: "collections", label: "Collections", icon: Layers },
];

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const results = useMemo(() => globalSearch(query), [query]);
  const flatResults = useMemo(
    () => GROUPS.flatMap((group) => results[group.key].map((item) => ({ ...item, group: group.key }))),
    [results],
  );

  useEffect(() => setActiveIndex(0), [query]);

  function go(href) {
    onClose();
    router.push(href);
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && flatResults[activeIndex]) {
      event.preventDefault();
      go(flatResults[activeIndex].href);
    }
  }

  const hasQuery = query.trim().length > 0;

  return (
    <Overlay open={open} onClose={onClose} labelledBy="command-palette-title">
      <div className="flex min-h-full items-start justify-center px-4 pt-24" onClick={onClose}>
        <div
          className="w-full max-w-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 border-b border-[var(--admin-border)] px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-[var(--admin-text-muted)]" />
            <input
              ref={inputRef}
              id="command-palette-title"
              data-autofocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search products, orders, customers, collections…"
              className="w-full bg-transparent text-sm text-[var(--admin-text)] outline-none placeholder:text-[var(--admin-text-muted)]"
            />
            <kbd className="hidden shrink-0 border border-[var(--admin-border)] px-1.5 py-0.5 text-[10px] text-[var(--admin-text-muted)] sm:block">
              Esc
            </kbd>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {!hasQuery && (
              <p className="px-3 py-6 text-center text-sm text-[var(--admin-text-muted)]">
                Try searching “Silk”, an order number like “LC-1048”, or a customer name.
              </p>
            )}
            {hasQuery && flatResults.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-[var(--admin-text-muted)]">
                No results for “{query}”.
              </p>
            )}
            {GROUPS.map((group) => {
              const items = results[group.key];
              if (!items.length) return null;
              const Icon = group.icon;
              return (
                <div key={group.key} className="mb-1">
                  <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
                    {group.label}
                  </p>
                  {items.map((item) => {
                    const flatIndex = flatResults.findIndex((r) => r.group === group.key && r.id === item.id);
                    const active = flatIndex === activeIndex;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onMouseEnter={() => setActiveIndex(flatIndex)}
                        onClick={() => go(item.href)}
                        className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm ${
                          active ? "bg-[var(--admin-surface-alt)]" : ""
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-[var(--admin-text-muted)]" />
                        <span className="min-w-0 flex-1 truncate text-[var(--admin-text)]">{item.label}</span>
                        <span className="shrink-0 truncate text-xs text-[var(--admin-text-muted)]">{item.meta}</span>
                        {active && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-[var(--admin-text-muted)]" />}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Overlay>
  );
}
