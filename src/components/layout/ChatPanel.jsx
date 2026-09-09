"use client";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

const TABS = [
  { label: "Home", Icon: HomeIcon },
  { label: "Saved", Icon: BookmarkIcon },
  { label: "Chat", Icon: ChatIcon, active: true },
  { label: "Account", Icon: AccountIcon },
];

export default function ChatPanel({ open, onClose }) {
  const { heading, assistantName, assistantRole, greeting, consentText, inputPlaceholder } =
    siteConfig.chat;

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
          "absolute right-0 top-0 flex h-full w-[92%] max-w-md flex-col bg-[var(--color-surface)] shadow-xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-line)] px-6 py-5">
          <span className="font-serif text-xl text-[var(--color-text)]">{heading}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="text-2xl leading-none text-[var(--color-text)]"
          >
            &times;
          </button>
        </div>

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

        <div className="grid grid-cols-4 border-t border-[var(--color-line)] px-2 py-3">
          {TABS.map(({ label, Icon, active }) => (
            <button
              key={label}
              type="button"
              className={cn(
                "flex flex-col items-center gap-1 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]",
                active && "text-[var(--color-primary)]",
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
