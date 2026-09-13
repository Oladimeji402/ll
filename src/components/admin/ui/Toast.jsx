"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastContext = createContext(null);

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };
const ICON_TONE = {
  success: "text-[var(--admin-success)]",
  error: "text-[var(--admin-danger)]",
  info: "text-[var(--admin-info)]",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [mounted, setMounted] = useState(false);
  const idRef = useRef(0);

  useEffect(() => setMounted(true), []);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "success", duration = 4000 }) => {
      const id = idRef.current++;
      setToasts((current) => [...current, { id, title, description, variant }]);
      if (duration) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {mounted &&
        createPortal(
          <div
            className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
            role="status"
            aria-live="polite"
          >
            {toasts.map((t) => {
              const Icon = ICONS[t.variant] ?? Info;
              return (
                <div
                  key={t.id}
                  className="pointer-events-auto flex items-start gap-3 border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3 shadow-lg"
                >
                  <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", ICON_TONE[t.variant])} aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--admin-text)]">{t.title}</p>
                    {t.description && (
                      <p className="mt-0.5 text-xs text-[var(--admin-text-muted)]">{t.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => dismiss(t.id)}
                    aria-label="Dismiss notification"
                    className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
