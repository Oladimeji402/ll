"use client";

import Link from "next/link";
import { Bell, ShoppingBag, AlertTriangle, RotateCcw, Info } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Panel from "@/components/admin/ui/Panel";
import Button from "@/components/admin/ui/Button";
import EmptyState from "@/components/admin/ui/EmptyState";
import { SkeletonRows } from "@/components/admin/ui/Skeleton";
import { cn } from "@/lib/utils";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { formatRelativeTime } from "@/lib/admin/utils/format";
import { useNotificationsStore } from "@/lib/admin/store/notifications-store";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/admin/services/notification-service";

const ICONS = {
  "new-order": ShoppingBag,
  "low-stock": AlertTriangle,
  "out-of-stock": AlertTriangle,
  "payment-failed": AlertTriangle,
  "return-requested": RotateCcw,
  system: Info,
};

export default function NotificationsPage() {
  const mounted = useMounted();
  const items = useNotificationsStore((s) => s.items);
  const sorted = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const unreadCount = sorted.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Notifications"
        description="Everything happening in your store."
        actions={
          unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={() => markAllNotificationsRead()}>
              Mark all as read
            </Button>
          )
        }
      />

      <Panel padded={false}>
        {!mounted ? (
          <SkeletonRows rows={6} cols={2} />
        ) : sorted.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
        ) : (
          <ul className="divide-y divide-[var(--admin-border)]">
            {sorted.map((notification) => {
              const Icon = ICONS[notification.type] ?? Info;
              return (
                <li key={notification.id}>
                  <Link
                    href={notification.href ?? "#"}
                    onClick={() => markNotificationRead(notification.id)}
                    className={cn(
                      "flex items-start gap-4 px-5 py-4 hover:bg-[var(--admin-surface-alt)] sm:px-6",
                      !notification.read && "bg-[var(--admin-surface-alt)]/50",
                    )}
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--admin-surface-alt)] text-[var(--admin-text-muted)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-[var(--admin-text)]">{notification.title}</span>
                      <span className="block text-sm text-[var(--admin-text-muted)]">{notification.body}</span>
                      <span className="mt-1 block text-xs text-[var(--admin-text-muted)]">{formatRelativeTime(notification.createdAt)}</span>
                    </span>
                    {!notification.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--color-primary)]" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
