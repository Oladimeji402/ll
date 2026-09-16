"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Panel from "@/components/admin/ui/Panel";
import Tabs from "@/components/admin/ui/Tabs";
import SearchInput from "@/components/admin/ui/SearchInput";
import DataTable from "@/components/admin/ui/DataTable";
import { StatusBadge } from "@/components/admin/ui/Badge";
import EmptyState from "@/components/admin/ui/EmptyState";
import ErrorState from "@/components/admin/ui/ErrorState";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { formatCurrency, formatDate } from "@/lib/admin/utils/format";
import { listReturns, getReturnCounts } from "@/lib/admin/services/return-service";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "requested", label: "Requested" },
  { value: "approved", label: "Approved" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
];

export default function ReturnsPage() {
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
    listReturns({ search, status, page, pageSize: 10 })
      .then(async (res) => {
        if (cancelled) return;
        setResult(res);
        const counts = await getReturnCounts();
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
    { key: "returnNumber", header: "Return", render: (r) => <span className="font-medium text-[var(--admin-text)]">{r.returnNumber}</span> },
    { key: "orderNumber", header: "Order", hideBelow: "md" },
    { key: "customerName", header: "Customer", hideBelow: "lg" },
    { key: "reason", header: "Reason", hideBelow: "lg" },
    { key: "refundAmount", header: "Refund", render: (r) => formatCurrency(r.refundAmount) },
    { key: "requestedAt", header: "Requested", hideBelow: "md", render: (r) => formatDate(r.requestedAt) },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Returns" description="Review and process customer return requests." />

      <Panel padded={false}>
        <div className="px-4 pt-4 sm:px-6 sm:pt-5">
          <Tabs tabs={tabs} value={status} onChange={setStatus} />
        </div>
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--admin-border)] px-4 py-3 sm:px-6">
          <SearchInput value={search} onChange={setSearch} placeholder="Search return, order, customer" className="max-w-xs" />
        </div>

        <DataTable
          columns={columns}
          rows={result?.items ?? []}
          onRowClick={(row) => router.push(`/admin/returns/${row.id}`)}
          loading={!mounted || loading}
          error={error && <ErrorState title="Unable to load returns" onRetry={() => setRefreshKey((k) => k + 1)} />}
          empty={<EmptyState icon={RotateCcw} title="No returns yet" description="Return requests from customers will appear here." />}
          renderMobileCard={(r) => (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[var(--admin-text)]">{r.returnNumber}</p>
                <p className="text-xs text-[var(--admin-text-muted)]">{r.orderNumber} · {formatCurrency(r.refundAmount)}</p>
              </div>
              <StatusBadge status={r.status} />
            </div>
          )}
          pagination={result && { page: result.page, totalPages: result.totalPages, total: result.total, pageSize: result.pageSize, onPageChange: setPage }}
        />
      </Panel>
    </div>
  );
}
