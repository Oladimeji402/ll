"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Panel from "@/components/admin/ui/Panel";
import Tabs from "@/components/admin/ui/Tabs";
import SearchInput from "@/components/admin/ui/SearchInput";
import DataTable from "@/components/admin/ui/DataTable";
import { StatusBadge } from "@/components/admin/ui/Badge";
import EmptyState from "@/components/admin/ui/EmptyState";
import ErrorState from "@/components/admin/ui/ErrorState";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { formatCurrency, formatDateTime } from "@/lib/admin/utils/format";
import { listPayments, getPaymentCounts } from "@/lib/admin/services/payment-service";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "successful", label: "Successful" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

export default function PaymentsPage() {
  const mounted = useMounted();
  const router = useRouter();

  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => setPage(1), [status, search]);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    setLoading(true);
    listPayments({ search, status, page, pageSize: 10 })
      .then(async (res) => {
        if (cancelled) return;
        setResult(res);
        const counts = await getPaymentCounts();
        if (cancelled) return;
        setCounts(counts);
        setLoading(false);
      })
      .catch(() => !cancelled && (setError(true), setLoading(false)));
    return () => {
      cancelled = true;
    };
  }, [mounted, search, status, page, refreshKey]);

  const tabs = STATUS_TABS.map((t) => ({ ...t, count: counts?.[t.value] }));

  const columns = [
    { key: "reference", header: "Reference", render: (p) => <span className="font-medium text-[var(--admin-text)]">{p.reference}</span> },
    { key: "orderNumber", header: "Order", hideBelow: "md" },
    { key: "customerName", header: "Customer", hideBelow: "lg" },
    { key: "amount", header: "Amount", render: (p) => formatCurrency(p.amount) },
    { key: "method", header: "Method", hideBelow: "lg" },
    { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
    { key: "date", header: "Date", hideBelow: "md", render: (p) => formatDateTime(p.date) },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Payments" description="All payment transactions across your orders." />

      <Panel padded={false}>
        <div className="px-4 pt-4 sm:px-6 sm:pt-5">
          <Tabs tabs={tabs} value={status} onChange={setStatus} />
        </div>
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--admin-border)] px-4 py-3 sm:px-6">
          <SearchInput value={search} onChange={setSearch} placeholder="Search reference, order, customer" className="max-w-xs" />
        </div>

        <DataTable
          columns={columns}
          rows={result?.items ?? []}
          onRowClick={(row) => router.push(`/admin/payments/${row.id}`)}
          loading={!mounted || loading}
          error={error && <ErrorState title="Unable to load payments" onRetry={() => setRefreshKey((k) => k + 1)} />}
          empty={<EmptyState icon={CreditCard} title="No payments yet" />}
          renderMobileCard={(p) => (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[var(--admin-text)]">{p.reference}</p>
                <p className="text-xs text-[var(--admin-text-muted)]">{p.orderNumber} · {formatCurrency(p.amount)}</p>
              </div>
              <StatusBadge status={p.status} />
            </div>
          )}
          pagination={result && { page: result.page, totalPages: result.totalPages, total: result.total, pageSize: result.pageSize, onPageChange: setPage }}
        />
      </Panel>
    </div>
  );
}
