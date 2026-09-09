"use client";

import { useState } from "react";
import { siteConfig } from "@/config/site";

export default function FloatingBadge() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-5 left-5 z-30 flex items-center gap-2 bg-[var(--color-primary)] py-3 pl-5 pr-3 text-[var(--color-on-primary)] shadow-lg">
      <span className="tracking-nav text-xs uppercase">
        {siteConfig.discountBadge}
      </span>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setDismissed(true)}
        className="ml-1 text-sm leading-none opacity-70 transition-opacity hover:opacity-100"
      >
        &times;
      </button>
    </div>
  );
}
