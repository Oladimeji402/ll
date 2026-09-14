"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Panel from "@/components/admin/ui/Panel";
import Tabs from "@/components/admin/ui/Tabs";
import SearchInput from "@/components/admin/ui/SearchInput";
import DataTable from "@/components/admin/ui/DataTable";
import Badge from "@/components/admin/ui/Badge";
import EmptyState from "@/components/admin/ui/EmptyState";
import ErrorState from "@/components/admin/ui/ErrorState";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { formatCurrency, formatDate } from "@/lib/admin/utils/format";
import { avatarColor, initials } from "@/lib/admin/utils/avatar";
import { listCustomers } from "@/lib/admin/services/customer-service";

const SEGMENTS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "returning", label: "Returning" },
  { value: "high-value", label: "High Value" },
  { value: "inactive", label: "Inactive" },
];

export default function CustomersPage() {
  const mounted = useMounted();
  const router = useRouter();

  const [segment, setSegment] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ field: "totalSpent", direction: "desc" });
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => setPage(1), [segment, search]);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    listCustomers({ search, segment, sort, page, pageSize: 10 })
      .then((res) => !cancelled && (setResult(res), setLoading(false)))
      .catch(() => !cancelled && (setError(true), setLoading(false)));
    return () => {
      cancelled = true;
    };
  }, [mounted, search, segment, sort, page, refreshKey]);

  function toggleSort(field) {
    setSort((s) => (s.field === field ? { field, direction: s.direction === "asc" ? "desc" : "asc" } : { field, direction: "desc" }));
  }

  const columns = [
    {
      key: "name",
      header: "Customer",
      sortable: true,
      render: (c) => (
        <div className="flex items-center gap-3">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: avatarColor(c.tone) }}
          >
            {initials(c.name)}
          </span>
          <span className="truncate font-medium text-[var(--admin-text)]">{c.name}</span>
        </div>
      ),
    },
    { key: "email", header: "Email", hideBelow: "lg" },
    { key: "ordersCount", header: "Orders", sortable: true, hideBelow: "md" },
    { key: "totalSpent", header: "Total spent", sortable: true, render: (c) => formatCurrency(c.totalSpent) },
    { key: "averageOrderValue", header: "Avg. order", hideBelow: "lg", render: (c) => formatCurrency(c.averageOrderValue) },
    {
      key: "lastOrderAt",
      header: "Last order",
      hideBelow: "md",
      render: (c) => (c.lastOrderAt ? formatDate(c.lastOrderAt) : "—"),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Customers" description="See who's shopping and how often." />

      <Panel padded={false}>
        <div className="px-4 pt-4 sm:px-6 sm:pt-5">
          <Tabs tabs={SEGMENTS} value={segment} onChange={setSegment} />
        </div>
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--admin-border)] px-4 py-3 sm:px-6">
          <SearchInput value={search} onChange={setSearch} placeholder="Search name or email" className="max-w-xs" />
        </div>

        <DataTable
          columns={columns}
          rows={result?.items ?? []}
          sort={sort}
          onSortChange={toggleSort}
          onRowClick={(row) => router.push(`/admin/customers/${row.id}`)}
          loading={!mounted || loading}
          error={error && <ErrorState title="Unable to load customers" onRetry={() => setRefreshKey((k) => k + 1)} />}
          empty={<EmptyState icon={Users} title="No customers yet" description="Customers will appear here once they place an order." />}
          renderMobileCard={(c) => (
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white" style={{ backgroundColor: avatarColor(c.tone) }}>
                {initials(c.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--admin-text)]">{c.name}</p>
                <p className="text-xs text-[var(--admin-text-muted)]">{c.ordersCount} orders · {formatCurrency(c.totalSpent)}</p>
              </div>
              <Badge tone="neutral" className="capitalize">{c.segment}</Badge>
            </div>
          )}
          pagination={result && { page: result.page, totalPages: result.totalPages, total: result.total, pageSize: result.pageSize, onPageChange: setPage }}
        />
      </Panel>
    </div>
  );
}
