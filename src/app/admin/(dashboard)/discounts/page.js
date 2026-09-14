"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tag, Plus } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Panel from "@/components/admin/ui/Panel";
import Tabs from "@/components/admin/ui/Tabs";
import SearchInput from "@/components/admin/ui/SearchInput";
import DataTable from "@/components/admin/ui/DataTable";
import { StatusBadge } from "@/components/admin/ui/Badge";
import Button from "@/components/admin/ui/Button";
import EmptyState from "@/components/admin/ui/EmptyState";
import ErrorState from "@/components/admin/ui/ErrorState";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { formatDate } from "@/lib/admin/utils/format";
import { listDiscounts } from "@/lib/admin/services/discount-service";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "scheduled", label: "Scheduled" },
  { value: "expired", label: "Expired" },
  { value: "disabled", label: "Disabled" },
];

export default function DiscountsPage() {
  const mounted = useMounted();
  const router = useRouter();

  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => setPage(1), [status, search]);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    setLoading(true);
    listDiscounts({ search, status, page, pageSize: 10 })
      .then((res) => !cancelled && (setResult(res), setLoading(false)))
      .catch(() => !cancelled && (setError(true), setLoading(false)));
    return () => {
      cancelled = true;
    };
  }, [mounted, search, status, page, refreshKey]);

  const columns = [
    { key: "code", header: "Code", render: (d) => <span className="font-medium text-[var(--admin-text)]">{d.code}</span> },
    { key: "type", header: "Type", hideBelow: "md", render: (d) => (d.type === "percentage" ? "Percentage" : "Fixed amount") },
    { key: "value", header: "Value", render: (d) => (d.type === "percentage" ? `${d.value}%` : `₦${d.value.toLocaleString("en-NG")}`) },
    { key: "usageCount", header: "Usage", hideBelow: "lg", render: (d) => `${d.usageCount}${d.usageLimit ? ` / ${d.usageLimit}` : ""}` },
    { key: "startDate", header: "Start", hideBelow: "lg", render: (d) => formatDate(d.startDate) },
    { key: "endDate", header: "Expiry", hideBelow: "lg", render: (d) => (d.endDate ? formatDate(d.endDate) : "No expiry") },
    { key: "status", header: "Status", render: (d) => <StatusBadge status={d.status} /> },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Discounts"
        description="Create and manage promotional codes."
        actions={
          <Button as="a" href="/admin/discounts/new" variant="primary" size="sm">
            <Plus className="h-4 w-4" /> Create discount
          </Button>
        }
      />

      <Panel padded={false}>
        <div className="px-4 pt-4 sm:px-6 sm:pt-5">
          <Tabs tabs={STATUS_TABS} value={status} onChange={setStatus} />
        </div>
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--admin-border)] px-4 py-3 sm:px-6">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by code" className="max-w-xs" />
        </div>

        <DataTable
          columns={columns}
          rows={result?.items ?? []}
          onRowClick={(row) => router.push(`/admin/discounts/${row.id}`)}
          loading={!mounted || loading}
          error={error && <ErrorState title="Unable to load discounts" onRetry={() => setRefreshKey((k) => k + 1)} />}
          empty={
            <EmptyState
              icon={Tag}
              title="No discounts yet"
              description="Create your first discount code to run a promotion."
              action={
                <Button as="a" href="/admin/discounts/new" variant="primary" size="sm">
                  <Plus className="h-4 w-4" /> Create discount
                </Button>
              }
            />
          }
          renderMobileCard={(d) => (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[var(--admin-text)]">{d.code}</p>
                <p className="text-xs text-[var(--admin-text-muted)]">{d.type === "percentage" ? `${d.value}%` : `₦${d.value.toLocaleString("en-NG")}`} off</p>
              </div>
              <StatusBadge status={d.status} />
            </div>
          )}
          pagination={result && { page: result.page, totalPages: result.totalPages, total: result.total, pageSize: result.pageSize, onPageChange: setPage }}
        />
      </Panel>
    </div>
  );
}
