"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, ShoppingBag, AlertTriangle, RotateCcw, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotificationsStore } from "@/lib/admin/store/notifications-store";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/admin/services/notification-service";
import { formatRelativeTime } from "@/lib/admin/utils/format";
import { useMounted } from "@/lib/admin/utils/use-mounted";

const ICONS = {
  "new-order": ShoppingBag,
  "low-stock": AlertTriangle,
  "out-of-stock": AlertTriangle,
  "payment-failed": AlertTriangle,
  "return-requested": RotateCcw,
  system: Info,
};

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const mounted = useMounted();
  const items = useNotificationsStore((s) => s.items);
  const sorted = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);
  const unreadCount = mounted ? items.filter((n) => !n.read).length : 0;

  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        className="relative flex h-9 w-9 items-center justify-center text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-alt)] hover:text-[var(--admin-text)]"
      >
        <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-[var(--admin-danger)]" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-lg">
          <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-4 py-3">
            <p className="text-sm font-medium text-[var(--admin-text)]">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllNotificationsRead()}
                className="text-xs text-[var(--color-primary)] hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {sorted.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-[var(--admin-text-muted)]">You&apos;re all caught up.</p>
            )}
            {sorted.map((notification) => {
              const Icon = ICONS[notification.type] ?? Info;
              return (
                <Link
                  key={notification.id}
                  href={notification.href ?? "/admin/notifications"}
                  onClick={() => {
                    markNotificationRead(notification.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex gap-3 border-b border-[var(--admin-border)] px-4 py-3 text-left last:border-0 hover:bg-[var(--admin-surface-alt)]",
                    !notification.read && "bg-[var(--admin-surface-alt)]/60",
                  )}
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--admin-text-muted)]" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-[var(--admin-text)]">{notification.title}</span>
                    <span className="block truncate text-xs text-[var(--admin-text-muted)]">{notification.body}</span>
                    <span className="mt-0.5 block text-[11px] text-[var(--admin-text-muted)]">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </span>
                  {!notification.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />}
                </Link>
              );
            })}
          </div>
          <Link
            href="/admin/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-[var(--admin-border)] px-4 py-2.5 text-center text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--admin-surface-alt)]"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
