"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { getAllCategories } from "@/data/categories";
import PlaceholderImage from "@/components/ui/PlaceholderImage";

const TABS = [
  { id: "home", label: "Home", Icon: HomeIcon },
  { id: "orders", label: "Saved", Icon: BookmarkIcon },
  { id: "chat", label: "Chat", Icon: ChatIcon },
  { id: "account", label: "Account", Icon: AccountIcon },
];

const featuredCategory = getAllCategories()[0];

export default function ChatPanel({ open, onClose }) {
  const [tab, setTab] = useState("chat");
  const { heading } = siteConfig.chat;

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
          {tab === "chat" ? (
            <span className="mr-auto font-serif text-xl text-[var(--color-text)]">{heading}</span>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="text-2xl leading-none text-[var(--color-text)]"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === "home" ? <HomeTab /> : null}
          {tab === "orders" ? <SignInTab heading={siteConfig.chat.orders.heading} /> : null}
          {tab === "chat" ? <ChatTab /> : null}
          {tab === "account" ? <SignInTab heading={siteConfig.chat.account.heading} /> : null}
        </div>

        <div className="grid grid-cols-4 border-t border-[var(--color-line)] px-2 py-3">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-pressed={tab === id}
              className={cn(
                "flex flex-col items-center gap-1 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]",
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

function EmailSignInForm() {
  const { emailPlaceholder, signInLabel } = siteConfig.chat;
  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3">
      <input
        type="email"
        required
        placeholder={emailPlaceholder}
        className="border border-[var(--color-line)] bg-transparent px-4 py-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
      />
      <button
        type="submit"
        className="tracking-nav bg-[var(--color-primary)] py-3 text-xs uppercase text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-dark)]"
      >
        {signInLabel}
      </button>
    </form>
  );
}

function HomeTab() {
  return (
    <div className="flex flex-col gap-6 px-6 py-6">
      <h2 className="font-serif text-2xl leading-snug text-[var(--color-primary)]">
        {siteConfig.chat.home.heading}
      </h2>
      <EmailSignInForm />

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

function SignInTab({ heading }) {
  return (
    <div className="flex flex-col gap-6 px-6 py-6">
      <h2 className="font-serif text-2xl leading-snug text-[var(--color-primary)]">{heading}</h2>
      <EmailSignInForm />
    </div>
  );
}

function ChatTab() {
  const { assistantName, assistantRole, greeting, consentText, inputPlaceholder } = siteConfig.chat;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-[90%] bg-[var(--color-bg-alt)] px-5 py-4">
          <p className="tracking-nav text-[11px] uppercase text-[var(--color-text-muted)]">
            {assistantName} &bull; {assistantRole}
          </p>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-[var(--color-text)]">
            {greeting.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      </div>

      <p className="px-6 text-center text-xs leading-relaxed text-[var(--color-text-muted)]">
        {consentText}
      </p>

      <div className="flex items-center gap-3 px-6 py-5">
        <button
          type="button"
          aria-label="Add attachment"
          className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--color-line)] text-[var(--color-text)] transition-colors hover:border-[var(--color-text)]"
        >
          <PlusIcon />
        </button>
        <input
          type="text"
          placeholder={inputPlaceholder}
          className="flex-1 border border-[var(--color-line)] bg-transparent px-4 py-2.5 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
        />
        <button
          type="button"
          aria-label="Send message"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-dark)]"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 19V5M6 11l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
