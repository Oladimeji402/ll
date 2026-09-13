"use client";

import { cn } from "@/lib/utils";
import Overlay, { DialogCloseButton } from "./Overlay";

export default function Drawer({ open, onClose, title, description, children, footer, width = "max-w-md" }) {
  return (
    <Overlay open={open} onClose={onClose} labelledBy="drawer-title">
      <div className="flex h-full justify-end" onClick={onClose}>
        <div
          className={cn(
            "flex h-full w-full flex-col bg-[var(--admin-surface)] shadow-xl transition-transform duration-300",
            width,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between border-b border-[var(--admin-border)] px-5 py-4">
            <div>
              <h2 id="drawer-title" className="font-serif text-lg text-[var(--admin-text)]" data-autofocus tabIndex={-1}>
                {title}
              </h2>
              {description && <p className="mt-1 text-sm text-[var(--admin-text-muted)]">{description}</p>}
            </div>
            <DialogCloseButton onClose={onClose} className="-mr-1 -mt-1" />
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
          {footer && (
            <div className="flex items-center justify-end gap-2 border-t border-[var(--admin-border)] px-5 py-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
}
