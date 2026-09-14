"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn, formatPrice } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import AuthForm from "@/components/auth/AuthForm";
import { createClient } from "@/lib/supabase/client";
import { useSupabaseUser } from "@/lib/supabase/use-user";

const TABS = [
  { id: "home", label: "Home", Icon: HomeIcon },
  { id: "orders", label: "Saved", Icon: BookmarkIcon },
  { id: "chat", label: "Chat", Icon: ChatIcon, disabled: true },
  { id: "account", label: "Account", Icon: AccountIcon },
];

export default function ChatPanel({ open, onClose }) {
  const [tab, setTab] = useState("home");
  const [featuredCategory, setFeaturedCategory] = useState(null);
  const user = useSupabaseUser();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/catalog/collections")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setFeaturedCategory(data[0] ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
          "absolute inset-x-0 bottom-0 flex h-[85vh] max-h-[720px] flex-col rounded-t-2xl bg-[var(--color-surface)] shadow-xl transition-transform duration-300 ease-out",
          "md:inset-x-auto md:inset-y-0 md:right-0 md:h-full md:w-[92%] md:max-w-md md:rounded-none",
          open ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-y-0 md:translate-x-full",
        )}
      >
        <div className="flex items-center justify-end border-b border-[var(--color-line)] px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="ml-auto text-2xl leading-none text-[var(--color-text)]"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === "home" ? <HomeTab featuredCategory={featuredCategory} user={user} /> : null}
          {tab === "orders" ? <OrdersTab user={user} onClose={onClose} /> : null}
          {tab === "account" ? <AccountTab user={user} onClose={onClose} /> : null}
        </div>

        <div className="grid grid-cols-4 border-t border-[var(--color-line)] px-2 py-3">
          {TABS.map(({ id, label, Icon, disabled }) => (
            <button
              key={id}
              type="button"
              disabled={disabled}
              title={disabled ? "Coming soon" : undefined}
              onClick={() => setTab(id)}
              aria-pressed={tab === id}
              className={cn(
                "flex flex-col items-center gap-1 text-[var(--color-text-muted)] transition-colors",
                disabled ? "cursor-not-allowed opacity-40" : "hover:text-[var(--color-primary)]",
                tab === id && "text-[var(--color-primary)]",
              )}
            >
              <Icon />
              <span className="tracking-nav text-[9px] uppercase">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function HomeTab({ featuredCategory, user }) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 px-6 py-6">
      <h2 className="font-serif text-2xl leading-snug text-[var(--color-primary)]">
        {siteConfig.chat.home.heading}
      </h2>

      {user === null && <AuthForm onSuccess={() => router.refresh()} />}

      {featuredCategory ? (
        <Link
          href={`/collections/${featuredCategory.slug}`}
          className="group block border border-[var(--color-line)]"
        >
          <div className="relative aspect-[16/9] overflow-hidden">
            <PlaceholderImage
              tone={0}
              alt={featuredCategory.title}
              zoomOnHover
              className="transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>
          <div className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="font-serif text-lg text-[var(--color-primary)]">
                {featuredCategory.title}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-[var(--color-text-muted)]">
                {featuredCategory.description}
              </p>
            </div>
            <span aria-hidden className="shrink-0 text-xl text-[var(--color-text-muted)]">
              &rsaquo;
            </span>
          </div>
        </Link>
      ) : null}
    </div>
  );
}

function OrdersTab({ user, onClose }) {
  const router = useRouter();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch("/api/account/orders")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setOrders(data);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (user === undefined) return null;

  if (user === null) {
    return (
      <div className="flex flex-col gap-6 px-6 py-6">
        <h2 className="font-serif text-2xl leading-snug text-[var(--color-primary)]">
          {siteConfig.chat.orders.heading}
        </h2>
        <AuthForm onSuccess={() => router.refresh()} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-6 py-6">
      <h2 className="font-serif text-2xl leading-snug text-[var(--color-primary)]">Your Orders</h2>

      {orders === null && <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>}

      {orders?.length === 0 && (
        <p className="text-sm text-[var(--color-text-muted)]">
          You haven&apos;t placed any orders yet.
        </p>
      )}

      {orders?.length > 0 && (
        <ul className="flex flex-col divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/account/orders/${order.orderNumber}`}
                onClick={onClose}
                className="flex items-center justify-between gap-4 py-4 hover:bg-[var(--color-bg-alt)]"
              >
                <div>
                  <p className="text-sm text-[var(--color-text)]">{order.orderNumber}</p>
                  <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                    {new Date(order.createdAt).toLocaleDateString("en-NG", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <p className="text-sm text-[var(--color-primary)]">{formatPrice(order.total)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AccountTab({ user, onClose }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  if (user === undefined) return null;

  if (user === null) {
    return (
      <div className="flex flex-col gap-6 px-6 py-6">
        <h2 className="font-serif text-2xl leading-snug text-[var(--color-primary)]">
          {siteConfig.chat.account.heading}
        </h2>
        <AuthForm onSuccess={() => router.refresh()} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-6 py-6">
      <div>
        <h2 className="font-serif text-2xl leading-snug text-[var(--color-primary)]">
          Hi, {(user.user_metadata?.name || user.email).split(" ")[0]}
        </h2>
        <p className="mt-1 truncate text-sm text-[var(--color-text-muted)]">{user.email}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/account/orders"
          onClick={onClose}
          className="tracking-nav border border-[var(--color-line)] py-3 text-center text-[10px] uppercase text-[var(--color-text-muted)] hover:border-[var(--color-text)]"
        >
          Orders
        </Link>
        <Link
          href="/account/profile"
          onClick={onClose}
          className="tracking-nav border border-[var(--color-line)] py-3 text-center text-[10px] uppercase text-[var(--color-text-muted)] hover:border-[var(--color-text)]"
        >
          Profile
        </Link>
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        className="tracking-nav w-full border border-[var(--color-text)] py-3 text-xs uppercase text-[var(--color-text)] transition-colors hover:bg-[var(--color-text)] hover:text-[var(--color-surface)]"
      >
        Sign Out
      </button>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8Z" strokeLinejoin="round" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 3h12v18l-6-4-6 4V3Z" strokeLinejoin="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 12a8 8 0 1 1 3.2 6.4L4 20l1.2-3.6A7.96 7.96 0 0 1 4 12Z" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6" strokeLinecap="round" />
    </svg>
  );
}
