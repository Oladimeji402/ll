"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Panel, { PanelHeader } from "@/components/admin/ui/Panel";
import Button from "@/components/admin/ui/Button";
import Textarea from "@/components/admin/ui/form/Textarea";
import Badge, { StatusBadge } from "@/components/admin/ui/Badge";
import Skeleton from "@/components/admin/ui/Skeleton";
import ErrorState from "@/components/admin/ui/ErrorState";
import { useToast } from "@/components/admin/ui/Toast";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/admin/utils/format";
import { avatarColor, initials } from "@/lib/admin/utils/avatar";
import { getCustomer, getCustomerOrders, addCustomerNote } from "@/lib/admin/services/customer-service";
import { getActivityForResource } from "@/lib/admin/services/activity-service";

export default function CustomerDetailPage({ params }) {
  const { id } = use(params);
  const mounted = useMounted();
  const router = useRouter();
  const toast = useToast();

  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    getCustomer(id).then((c) => {
      if (cancelled) return;
      if (!c) {
        setError(true);
      } else {
        setCustomer(c);
        setNote(c.notes || "");
        setOrders(getCustomerOrders(id));
        setActivity(getActivityForResource(id));
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [mounted, id]);

  async function handleSaveNote() {
    setSaving(true);
    try {
      await addCustomerNote(id, note);
      toast({ title: "Note saved" });
    } finally {
      setSaving(false);
    }
  }

  if (!mounted || loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !customer) {
    return <ErrorState title="Customer not found" onRetry={() => router.push("/admin/customers")} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/customers" className="flex w-fit items-center gap-1.5 text-sm text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]">
        <ArrowLeft className="h-4 w-4" /> Back to customers
      </Link>

      <PageHeader
        title={customer.name}
        description={`Customer since ${formatDate(customer.createdAt)}`}
        actions={<Badge tone="neutral" className="capitalize">{customer.segment}</Badge>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="grid grid-cols-3 gap-4">
            <Panel>
              <p className="text-xs text-[var(--admin-text-muted)]">Lifetime value</p>
              <p className="mt-1 truncate text-lg font-semibold tabular-nums text-[var(--admin-text)]">{formatCurrency(customer.totalSpent)}</p>
            </Panel>
            <Panel>
              <p className="text-xs text-[var(--admin-text-muted)]">Orders</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--admin-text)]">{customer.ordersCount}</p>
            </Panel>
            <Panel>
              <p className="text-xs text-[var(--admin-text-muted)]">Avg. order value</p>
              <p className="mt-1 truncate text-lg font-semibold tabular-nums text-[var(--admin-text)]">{formatCurrency(customer.averageOrderValue)}</p>
            </Panel>
          </div>

          <Panel padded={false}>
            <PanelHeader title="Purchase history" className="px-5 pt-5 sm:px-6" />
            {orders.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-[var(--admin-text-muted)] sm:px-6">No orders yet.</p>
            ) : (
              <div className="divide-y divide-[var(--admin-border)]">
                {orders.map((order) => (
                  <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-[var(--admin-surface-alt)] sm:px-6">
                    <div>
                      <p className="text-[var(--admin-text)]">{order.orderNumber}</p>
                      <p className="text-xs text-[var(--admin-text-muted)]">{formatDate(order.createdAt)}</p>
                    </div>
                    <StatusBadge status={order.fulfillmentStatus} />
                    <p className="font-medium text-[var(--admin-text)]">{formatCurrency(order.total)}</p>
                  </Link>
                ))}
              </div>
            )}
          </Panel>

          <Panel padded={false}>
            <PanelHeader title="Activity" className="px-5 pt-5 sm:px-6" />
            {activity.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-[var(--admin-text-muted)] sm:px-6">No activity recorded yet.</p>
            ) : (
              <ul className="divide-y divide-[var(--admin-border)]">
                {activity.map((entry) => (
                  <li key={entry.id} className="px-5 py-3 text-sm sm:px-6">
                    <p className="text-[var(--admin-text)]">{entry.details}</p>
                    <p className="text-xs text-[var(--admin-text-muted)]">{formatDateTime(entry.timestamp)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel>
            <PanelHeader title="Profile" />
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white" style={{ backgroundColor: avatarColor(customer.tone) }}>
                {initials(customer.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--admin-text)]">{customer.name}</p>
                <p className="truncate text-xs text-[var(--admin-text-muted)]">{customer.email}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-1 text-sm text-[var(--admin-text-muted)]">
              <p>{customer.phone}</p>
              <p>{customer.address.line1}</p>
              <p>{customer.address.city}, {customer.address.state}, {customer.address.country}</p>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Notes" />
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="Add a private note about this customer…" />
            <Button variant="secondary" size="sm" className="mt-3" loading={saving} onClick={handleSaveNote}>
              Save note
            </Button>
          </Panel>
        </div>
      </div>
    </div>
  );
}
