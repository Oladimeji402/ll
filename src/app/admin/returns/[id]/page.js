"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Panel, { PanelHeader } from "@/components/admin/ui/Panel";
import Button from "@/components/admin/ui/Button";
import { StatusBadge } from "@/components/admin/ui/Badge";
import Skeleton from "@/components/admin/ui/Skeleton";
import ErrorState from "@/components/admin/ui/ErrorState";
import { useToast } from "@/components/admin/ui/Toast";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { formatCurrency, formatDateTime } from "@/lib/admin/utils/format";
import { getReturn, updateReturnStatus } from "@/lib/admin/services/return-service";

const NEXT_STEP = { requested: "approved", approved: "processing", processing: "completed" };

export default function ReturnDetailPage({ params }) {
  const { id } = use(params);
  const mounted = useMounted();
  const router = useRouter();
  const toast = useToast();
  const [ret, setRet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    getReturn(id).then((r) => {
      if (!r) setError(true);
      else setRet(r);
      setLoading(false);
    });
  }, [mounted, id]);

  async function handleStatus(status) {
    setBusy(true);
    try {
      const updated = await updateReturnStatus(id, status);
      setRet(updated);
      toast({ title: `Return marked as ${status}` });
    } finally {
      setBusy(false);
    }
  }

  if (!mounted || loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !ret) {
    return <ErrorState title="Return not found" onRetry={() => router.push("/admin/returns")} />;
  }

  const next = NEXT_STEP[ret.status];
  const isFinal = ["completed", "rejected"].includes(ret.status);

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/returns" className="flex w-fit items-center gap-1.5 text-sm text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]">
        <ArrowLeft className="h-4 w-4" /> Back to returns
      </Link>

      <PageHeader
        title={ret.returnNumber}
        description={`Requested ${formatDateTime(ret.requestedAt)}`}
        actions={
          <>
            <StatusBadge status={ret.status} />
            {!isFinal && next && (
              <Button variant="secondary" size="sm" loading={busy} onClick={() => handleStatus(next)}>
                Mark as {next}
              </Button>
            )}
            {!isFinal && (
              <Button variant="danger" size="sm" loading={busy} onClick={() => handleStatus("rejected")}>
                Reject
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="Return items" />
          <ul className="flex flex-col gap-3">
            {ret.items.map((item, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-[var(--admin-text)]">{item.title}</span>
                <span className="text-[var(--admin-text-muted)]">Qty {item.quantity}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-[var(--admin-border)] pt-3 text-sm font-medium text-[var(--admin-text)]">
            <span>Refund amount</span>
            <span>{formatCurrency(ret.refundAmount)}</span>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Details" />
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--admin-text-muted)]">Customer</dt><dd className="text-[var(--admin-text)]">{ret.customerName}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--admin-text-muted)]">Reason</dt><dd className="text-[var(--admin-text)]">{ret.reason}</dd></div>
            <div className="flex justify-between">
              <dt className="text-[var(--admin-text-muted)]">Order</dt>
              <dd><Link href={`/admin/orders/${ret.orderId}`} className="text-[var(--color-primary)] hover:underline">{ret.orderNumber}</Link></dd>
            </div>
            {ret.notes && <div className="flex justify-between"><dt className="text-[var(--admin-text-muted)]">Notes</dt><dd className="text-[var(--admin-text)]">{ret.notes}</dd></div>}
          </dl>
        </Panel>
      </div>
    </div>
  );
}
