"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Truck, XCircle } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Panel from "@/components/admin/ui/Panel";
import Tabs from "@/components/admin/ui/Tabs";
import SearchInput from "@/components/admin/ui/SearchInput";
import DataTable from "@/components/admin/ui/DataTable";
import { StatusBadge } from "@/components/admin/ui/Badge";
import BulkActionBar from "@/components/admin/ui/BulkActionBar";
import Button from "@/components/admin/ui/Button";
import EmptyState from "@/components/admin/ui/EmptyState";
import ErrorState from "@/components/admin/ui/ErrorState";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { formatCurrency, formatDate } from "@/lib/admin/utils/format";
import { listOrders, getOrderCounts, bulkUpdateFulfillment } from "@/lib/admin/services/order-service";
import { useToast } from "@/components/admin/ui/Toast";

const VIEWS = [
  { value: "all", label: "All" },
  { value: "unfulfilled", label: "Unfulfilled" },
  { value: "unpaid", label: "Unpaid" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "returned", label: "Returned" },
];

export default function OrdersPage() {
  const mounted = useMounted();
  const router = useRouter();
  const toast = useToast();

  const [view, setView] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ field: "createdAt", direction: "desc" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [result, setResult] = useState(null);
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => setPage(1), [view, search]);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    listOrders({ search, view, sort, page, pageSize: 10 })
      .then((res) => {
        if (cancelled) return;
        setResult(res);
        setCounts(getOrderCounts());
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [mounted, search, view, sort, page, refreshKey]);

  const tabs = useMemo(
    () => VIEWS.map((v) => ({ ...v, count: counts?.[v.value] })),
    [counts],
  );

  function toggleSort(field) {
    setSort((s) => (s.field === field ? { field, direction: s.direction === "asc" ? "desc" : "asc" } : { field, direction: "asc" }));
  }

  function toggleRow(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      if (!result) return prev;
      const allSelected = result.items.every((o) => prev.has(o.id));
      return allSelected ? new Set() : new Set(result.items.map((o) => o.id));
    });
  }

  async function handleBulk(status) {
    await bulkUpdateFulfillment(Array.from(selected), status);
    toast({ title: `${selected.size} order(s) marked as ${status}` });
    setSelected(new Set());
    setRefreshKey((k) => k + 1);
  }

  const columns = [
    {
      key: "orderNumber",
      header: "Order",
      sortable: true,
      render: (o) => <span className="font-medium text-[var(--admin-text)]">{o.orderNumber}</span>,
    },
    { key: "customerName", header: "Customer", sortable: true },
    {
      key: "createdAt",
      header: "Date",
      sortable: true,
      hideBelow: "md",
      render: (o) => formatDate(o.createdAt),
    },
    { key: "items", header: "Items", hideBelow: "lg", render: (o) => o.items.reduce((s, i) => s + i.quantity, 0) },
    { key: "total", header: "Total", sortable: true, render: (o) => formatCurrency(o.total) },
    { key: "paymentStatus", header: "Payment", render: (o) => <StatusBadge status={o.paymentStatus} /> },
    { key: "fulfillmentStatus", header: "Fulfillment", render: (o) => <StatusBadge status={o.fulfillmentStatus} /> },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Orders" description="Track, fulfill, and manage every order." />

      <Panel padded={false}>
        <div className="px-4 pt-4 sm:px-6 sm:pt-5">
          <Tabs tabs={tabs} value={view} onChange={setView} />
        </div>
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--admin-border)] px-4 py-3 sm:px-6">
          <SearchInput value={search} onChange={setSearch} placeholder="Search order # or customer" className="max-w-xs" />
        </div>

        {selected.size > 0 && (
          <div className="px-4 pt-3 sm:px-6">
            <BulkActionBar
              count={selected.size}
              onClear={() => setSelected(new Set())}
              actions={
                <>
                  <Button size="sm" variant="secondary" onClick={() => handleBulk("processing")}>
                    <ShoppingBag className="h-3.5 w-3.5" /> Mark processing
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleBulk("shipped")}>
                    <Truck className="h-3.5 w-3.5" /> Mark shipped
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleBulk("cancelled")}>
                    <XCircle className="h-3.5 w-3.5" /> Cancel
                  </Button>
                </>
              }
            />
          </div>
        )}

        <DataTable
          columns={columns}
          rows={result?.items ?? []}
          sort={sort}
          onSortChange={toggleSort}
          selectable
          selectedIds={selected}
          onToggleRow={toggleRow}
          onToggleAll={toggleAll}
          onRowClick={(row) => router.push(`/admin/orders/${row.id}`)}
          loading={!mounted || loading}
          error={
            error && (
              <ErrorState title="Unable to load orders" description="Something went wrong while loading your orders." onRetry={() => setRefreshKey((k) => k + 1)} />
            )
          }
          empty={
            <EmptyState
              icon={ShoppingBag}
              title={search ? "No orders match your search" : "No orders yet"}
              description={search ? "Try a different order number or customer name." : "Orders will show up here once customers start checking out."}
            />
          }
          renderMobileCard={(o) => (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[var(--admin-text)]">{o.orderNumber}</span>
                <span className="font-medium text-[var(--admin-text)]">{formatCurrency(o.total)}</span>
              </div>
              <p className="text-xs text-[var(--admin-text-muted)]">{o.customerName} · {formatDate(o.createdAt)}</p>
              <div className="flex gap-2">
                <StatusBadge status={o.paymentStatus} />
                <StatusBadge status={o.fulfillmentStatus} />
              </div>
            </div>
          )}
          pagination={
            result && {
              page: result.page,
              totalPages: result.totalPages,
              total: result.total,
              pageSize: result.pageSize,
              onPageChange: setPage,
            }
          }
        />
      </Panel>
    </div>
  );
}
