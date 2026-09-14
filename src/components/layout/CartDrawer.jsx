"use client";

import { cn, formatPrice } from "@/lib/utils";
import { useCartStore, useCartSubtotal } from "@/lib/store/cart-store";
import { useMounted } from "@/hooks/useMounted";
import Button from "@/components/ui/Button";
import PlaceholderImage from "@/components/ui/PlaceholderImage";

export default function CartDrawer({ open, onClose }) {
  const mounted = useMounted();
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartSubtotal();
  const hasItems = mounted && items.length > 0;

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
          <span className="font-serif text-lg text-[var(--color-primary)]">
            Your Bag {hasItems && `(${items.length})`}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close bag"
            className="text-2xl leading-none text-[var(--color-text)]"
          >
            &times;
          </button>
        </div>

        {!hasItems ? (
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
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <ul className="flex flex-col gap-5">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-4">
                    <div className="relative h-24 w-20 shrink-0 bg-[var(--color-image-bg)]">
                      <PlaceholderImage tone={item.tone} alt={item.name} fill />
                    </div>

                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm text-[var(--color-text)]">{item.name}</p>
                          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">Size {item.size}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="text-xs text-[var(--color-text-muted)] underline underline-offset-2 hover:text-[var(--color-text)]"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-center border border-[var(--color-line)]">
                          <button
                            type="button"
                            onClick={() => setQuantity(item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="flex h-7 w-7 items-center justify-center text-[var(--color-text)]"
                          >
                            &minus;
                          </button>
                          <span className="w-6 text-center text-sm text-[var(--color-text)]">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => setQuantity(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                            className="flex h-7 w-7 items-center justify-center text-[var(--color-text)]"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-sm text-[var(--color-primary)]">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-[var(--color-line)] px-6 py-5">
              <div className="flex items-center justify-between text-sm text-[var(--color-text)]">
                <span>Subtotal</span>
                <span className="text-base text-[var(--color-primary)]">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Shipping and taxes calculated at checkout.</p>

              <button
                type="button"
                disabled
                title="Checkout is coming soon"
                className="tracking-nav mt-4 w-full cursor-not-allowed bg-[var(--color-primary)]/50 py-4 text-xs uppercase text-[var(--color-on-primary)]"
              >
                Checkout — Coming Soon
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
