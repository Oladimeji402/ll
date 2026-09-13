"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared backdrop + escape-to-close + scroll-lock behavior for Modal and
 * Drawer. Renders via a portal so it always sits above the admin layout.
 */
export default function Overlay({ open, onClose, children, labelledBy }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", handleKeyDown);
    containerRef.current?.querySelector("[data-autofocus]")?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (typeof document === "undefined" || !open) return null;

  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      className="fixed inset-0 z-[100]"
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      {/* Positioned (not static) so it paints above the backdrop button
          regardless of DOM order — CSS stacks positioned siblings above
          static ones by default, which otherwise swallows every click. */}
      <div className="relative h-full">{children}</div>
    </div>,
    document.body,
  );
}

export function DialogCloseButton({ onClose, className }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close"
      className={cn(
        "flex h-8 w-8 items-center justify-center text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-alt)] hover:text-[var(--admin-text)]",
        className,
      )}
    >
      <X className="h-4 w-4" strokeWidth={1.75} />
    </button>
  );
}
