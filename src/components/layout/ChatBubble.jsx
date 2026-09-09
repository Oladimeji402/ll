"use client";

import { useState } from "react";
import { siteConfig } from "@/config/site";
import ChatPanel from "./ChatPanel";

export default function ChatBubble() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={siteConfig.chatBubbleLabel}
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-30 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-lg transition-transform duration-300 hover:scale-105"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path
            d="M4 12a8 8 0 1 1 3.2 6.4L4 20l1.2-3.6A7.96 7.96 0 0 1 4 12Z"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <ChatPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
