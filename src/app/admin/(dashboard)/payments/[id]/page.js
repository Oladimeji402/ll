"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Panel, { PanelHeader } from "@/components/admin/ui/Panel";
import { StatusBadge } from "@/components/admin/ui/Badge";
import Skeleton from "@/components/admin/ui/Skeleton";
import ErrorState from "@/components/admin/ui/ErrorState";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { formatCurrency, formatDateTime } from "@/lib/admin/utils/format";
import { getPayment } from "@/lib/admin/services/payment-service";

export default function PaymentDetailPage({ params }) {
  const { id } = use(params);
  const mounted = useMounted();
  const router = useRouter();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    getPayment(id).then((p) => {
      if (!p) setError(true);
      else setPayment(p);
      setLoading(false);
    });
  }, [mounted, id]);

  if (!mounted || loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !payment) {
    return <ErrorState title="Payment not found" onRetry={() => router.push("/admin/payments")} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/payments" className="flex w-fit items-center gap-1.5 text-sm text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]">
        <ArrowLeft className="h-4 w-4" /> Back to payments
      </Link>

      <PageHeader title={payment.reference} description={formatDateTime(payment.date)} actions={<StatusBadge status={payment.status} />} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="Transaction" />
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--admin-text-muted)]">Amount</dt><dd className="font-medium text-[var(--admin-text)]">{formatCurrency(payment.amount)}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--admin-text-muted)]">Method</dt><dd className="text-[var(--admin-text)]">{payment.method}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--admin-text-muted)]">Status</dt><dd><StatusBadge status={payment.status} /></dd></div>
            <div className="flex justify-between"><dt className="text-[var(--admin-text-muted)]">Note</dt><dd className="text-[var(--admin-text)]">{payment.gatewayNote}</dd></div>
          </dl>
        </Panel>
        <Panel>
          <PanelHeader title="Order" />
          <p className="text-sm text-[var(--admin-text-muted)]">Customer</p>
          <p className="mb-3 text-[var(--admin-text)]">{payment.customerName}</p>
          <Link href={`/admin/orders/${payment.orderId}`} className="text-sm font-medium text-[var(--color-primary)] hover:underline">
            View order {payment.orderNumber}
          </Link>
        </Panel>
      </div>
    </div>
  );
}
