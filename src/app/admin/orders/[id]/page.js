"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Circle, Package, Truck, Home, XCircle, RotateCcw } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Panel, { PanelHeader } from "@/components/admin/ui/Panel";
import Button from "@/components/admin/ui/Button";
import { StatusBadge } from "@/components/admin/ui/Badge";
import Modal from "@/components/admin/ui/Modal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import Field from "@/components/admin/ui/form/Field";
import Input from "@/components/admin/ui/form/Input";
import Skeleton from "@/components/admin/ui/Skeleton";
import ErrorState from "@/components/admin/ui/ErrorState";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { useToast } from "@/components/admin/ui/Toast";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { formatCurrency, formatDateTime } from "@/lib/admin/utils/format";
import {
  getOrder,
  updateFulfillmentStatus,
  addTrackingNumber,
  cancelOrder,
  refundOrder,
} from "@/lib/admin/services/order-service";

const TIMELINE_STEPS = ["Order placed", "Payment confirmed", "Processing", "Shipped", "Delivered"];
const TIMELINE_ICONS = { "Order placed": Circle, "Payment confirmed": Check, Processing: Package, Shipped: Truck, Delivered: Home };

const NEXT_STATUS = {
  unfulfilled: { label: "Mark as processing", value: "processing" },
  processing: { label: "Mark as shipped", value: "shipped" },
  shipped: { label: "Mark as delivered", value: "delivered" },
};

export default function OrderDetailPage({ params }) {
  const { id } = use(params);
  const mounted = useMounted();
  const router = useRouter();
  const toast = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [tracking, setTracking] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    setLoading(true);
    getOrder(id)
      .then((o) => {
        if (cancelled) return;
        if (!o) {
          setError(true);
        } else {
          setOrder(o);
          setRefundAmount(o.total);
        }
        setLoading(false);
      })
      .catch(() => !cancelled && (setError(true), setLoading(false)));
    return () => {
      cancelled = true;
    };
  }, [mounted, id]);

  async function handleStatusChange(status) {
    setBusy(true);
    try {
      const updated = await updateFulfillmentStatus(order.id, status);
      setOrder(updated);
      toast({ title: `Order marked as ${status}` });
    } finally {
      setBusy(false);
    }
  }

  async function handleAddTracking() {
    if (!tracking.trim()) return;
    setBusy(true);
    try {
      const updated = await addTrackingNumber(order.id, tracking.trim());
      setOrder(updated);
      toast({ title: "Tracking number added" });
      setTrackingOpen(false);
      setTracking("");
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    const updated = await cancelOrder(order.id, "Cancelled by admin");
    setOrder(updated);
    toast({ title: "Order cancelled", variant: "info" });
  }

  async function handleRefund() {
    const updated = await refundOrder(order.id, Number(refundAmount));
    setOrder(updated);
    toast({ title: "Refund issued" });
    setRefundOpen(false);
  }

  if (!mounted || loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !order) {
    return <ErrorState title="Order not found" description="This order may have been removed." onRetry={() => router.push("/admin/orders")} />;
  }

  const canCancel = !["cancelled", "delivered", "returned"].includes(order.fulfillmentStatus);
  const canRefund = order.paymentStatus === "paid";
  const next = NEXT_STATUS[order.fulfillmentStatus];
  const reachedLabels = new Set(order.timeline.map((t) => t.label));

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/orders" className="flex w-fit items-center gap-1.5 text-sm text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <PageHeader
        title={order.orderNumber}
        description={`Placed ${formatDateTime(order.createdAt)}`}
        actions={
          <>
            <StatusBadge status={order.paymentStatus} />
            <StatusBadge status={order.fulfillmentStatus} />
            {next && (
              <Button variant="secondary" size="sm" loading={busy} onClick={() => handleStatusChange(next.value)}>
                {next.label}
              </Button>
            )}
            {["unfulfilled", "processing"].includes(order.fulfillmentStatus) && (
              <Button variant="secondary" size="sm" onClick={() => setTrackingOpen(true)}>
                <Truck className="h-3.5 w-3.5" /> Add tracking
              </Button>
            )}
            {canRefund && (
              <Button variant="secondary" size="sm" onClick={() => setRefundOpen(true)}>
                <RotateCcw className="h-3.5 w-3.5" /> Refund
              </Button>
            )}
            {canCancel && (
              <Button variant="danger" size="sm" onClick={() => setCancelOpen(true)}>
                <XCircle className="h-3.5 w-3.5" /> Cancel order
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Panel padded={false}>
            <PanelHeader title="Items" className="px-5 pt-5 sm:px-6" />
            <div className="divide-y divide-[var(--admin-border)]">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4 sm:px-6">
                  <div className="h-14 w-14 shrink-0 overflow-hidden">
                    <PlaceholderImage tone={item.tone} alt={item.title} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[var(--admin-text)]">{item.title}</p>
                    <p className="text-xs text-[var(--admin-text-muted)]">
                      {item.variant ? `${item.variant} · ` : ""}
                      {item.sku} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium text-[var(--admin-text)]">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t border-[var(--admin-border)] px-5 py-4 text-sm sm:px-6">
              <div className="flex justify-between text-[var(--admin-text-muted)]">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[var(--admin-text-muted)]">
                <span>Shipping</span>
                <span>{order.shippingCost === 0 ? "Free" : formatCurrency(order.shippingCost)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-[var(--admin-text-muted)]">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[var(--admin-text-muted)]">
                <span>Tax</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--admin-border)] pt-2 text-base font-medium text-[var(--admin-text)]">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
              <div className="flex justify-between pt-1 text-xs text-[var(--admin-text-muted)]">
                <span>Payment method</span>
                <span>{order.paymentMethod}</span>
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Fulfillment Timeline" />
            <ol className="flex flex-col gap-4">
              {TIMELINE_STEPS.map((label) => {
                const event = order.timeline.find((t) => t.label === label);
                const done = reachedLabels.has(label);
                const Icon = TIMELINE_ICONS[label] ?? Circle;
                return (
                  <li key={label} className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                        done ? "bg-[var(--color-primary)] text-white" : "bg-[var(--admin-surface-alt)] text-[var(--admin-text-muted)]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                    </span>
                    <span>
                      <span className={`block text-sm ${done ? "text-[var(--admin-text)]" : "text-[var(--admin-text-muted)]"}`}>{label}</span>
                      {event && <span className="block text-xs text-[var(--admin-text-muted)]">{formatDateTime(event.timestamp)}</span>}
                    </span>
                  </li>
                );
              })}
              {order.timeline
                .filter((t) => !TIMELINE_STEPS.includes(t.label))
                .map((event) => (
                  <li key={event.id} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--admin-danger-bg)] text-[var(--admin-danger)]">
                      <XCircle className="h-3.5 w-3.5" strokeWidth={2} />
                    </span>
                    <span>
                      <span className="block text-sm text-[var(--admin-text)]">{event.label}</span>
                      <span className="block text-xs text-[var(--admin-text-muted)]">{formatDateTime(event.timestamp)}</span>
                      {event.note && <span className="block text-xs text-[var(--admin-text-muted)]">{event.note}</span>}
                    </span>
                  </li>
                ))}
              {order.trackingNumber && (
                <li className="ml-9 border-t border-[var(--admin-border)] pt-3 text-xs text-[var(--admin-text-muted)]">
                  Tracking number: <span className="text-[var(--admin-text)]">{order.trackingNumber}</span>
                </li>
              )}
            </ol>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel>
            <PanelHeader title="Customer" />
            <p className="text-sm text-[var(--admin-text)]">{order.customerName}</p>
            <p className="text-sm text-[var(--admin-text-muted)]">{order.email}</p>
            <Link href={`/admin/customers/${order.customerId}`} className="mt-3 inline-block text-xs font-medium text-[var(--color-primary)] hover:underline">
              View customer profile
            </Link>
          </Panel>

          <Panel>
            <PanelHeader title="Shipping Address" />
            <p className="text-sm text-[var(--admin-text)]">{order.shippingAddress.line1}</p>
            <p className="text-sm text-[var(--admin-text-muted)]">
              {order.shippingAddress.city}, {order.shippingAddress.state}
            </p>
            <p className="text-sm text-[var(--admin-text-muted)]">
              {order.shippingAddress.postalCode}, {order.shippingAddress.country}
            </p>
          </Panel>
        </div>
      </div>

      <Modal
        open={trackingOpen}
        onClose={() => setTrackingOpen(false)}
        title="Add tracking number"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setTrackingOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={busy} onClick={handleAddTracking}>Save</Button>
          </>
        }
      >
        <Field label="Tracking number" required>
          <Input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="e.g. NG123456789" />
        </Field>
      </Modal>

      <Modal
        open={refundOpen}
        onClose={() => setRefundOpen(false)}
        title="Refund order"
        description="This will mark the order as refunded."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setRefundOpen(false)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleRefund}>Issue refund</Button>
          </>
        }
      >
        <Field label="Refund amount" required>
          <Input type="number" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} />
        </Field>
      </Modal>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        title="Cancel this order?"
        description={`${order.orderNumber} will be marked as cancelled.`}
        confirmLabel="Cancel order"
      />
    </div>
  );
}
