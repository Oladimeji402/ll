"use client";

import { cn } from "@/lib/utils";
import Overlay, { DialogCloseButton } from "./Overlay";

export default function Modal({ open, onClose, title, description, children, footer, size = "md" }) {
  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };
  return (
    <Overlay open={open} onClose={onClose} labelledBy="modal-title">
      <div className="flex min-h-full items-center justify-center p-4" onClick={onClose}>
        <div
          className={cn(
            "w-full bg-[var(--admin-surface)] shadow-xl",
            widths[size],
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between border-b border-[var(--admin-border)] px-5 py-4">
            <div>
              <h2 id="modal-title" className="font-serif text-lg text-[var(--admin-text)]" data-autofocus tabIndex={-1}>
                {title}
              </h2>
              {description && <p className="mt-1 text-sm text-[var(--admin-text-muted)]">{description}</p>}
            </div>
            <DialogCloseButton onClose={onClose} className="-mr-1 -mt-1" />
          </div>
          <div className="max-h-[70vh] overflow-y-auto px-5 py-5">{children}</div>
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
