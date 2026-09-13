"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Plus, Archive, CheckCircle2 } from "lucide-react";
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
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { formatCurrency, formatDate } from "@/lib/admin/utils/format";
import { listProducts, bulkUpdateStatus } from "@/lib/admin/services/product-service";
import { useCollectionsStore } from "@/lib/admin/store/collections-store";
import { useToast } from "@/components/admin/ui/Toast";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

export default function ProductsPage() {
  const mounted = useMounted();
  const router = useRouter();
  const toast = useToast();
  const collections = useCollectionsStore((s) => s.items);

  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ field: "updatedAt", direction: "desc" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => setPage(1), [status, search]);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    listProducts({ search, status, sort, page, pageSize: 10 })
      .then((res) => {
        if (!cancelled) {
          setResult(res);
          setLoading(false);
        }
      })
      .catch(() => !cancelled && (setError(true), setLoading(false)));
    return () => {
      cancelled = true;
    };
  }, [mounted, search, status, sort, page, refreshKey]);

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
      const allSelected = result.items.every((p) => prev.has(p.id));
      return allSelected ? new Set() : new Set(result.items.map((p) => p.id));
    });
  }

  async function handleBulkStatus(next) {
    await bulkUpdateStatus(Array.from(selected), next);
    toast({ title: `${selected.size} product(s) updated` });
    setSelected(new Set());
    setRefreshKey((k) => k + 1);
  }

  const columns = [
    {
      key: "title",
      header: "Product",
      sortable: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden">
            <PlaceholderImage tone={p.images[0]?.tone ?? 0} alt={p.title} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-[var(--admin-text)]">{p.title}</p>
            <p className="truncate text-xs text-[var(--admin-text-muted)]">{p.sku}</p>
          </div>
        </div>
      ),
    },
    { key: "price", header: "Price", sortable: true, hideBelow: "md", render: (p) => formatCurrency(p.price) },
    {
      key: "quantity",
      header: "Inventory",
      sortable: true,
      hideBelow: "md",
      render: (p) => (p.quantity === 0 ? <span className="text-[var(--admin-danger)]">0</span> : p.quantity),
    },
    {
      key: "collectionIds",
      header: "Collections",
      hideBelow: "lg",
      render: (p) => (
        <span className="text-xs text-[var(--admin-text-muted)]">
          {p.collectionIds
            .map((id) => collections.find((c) => c.id === id)?.title)
            .filter(Boolean)
            .slice(0, 2)
            .join(", ") || "—"}
        </span>
      ),
    },
    { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
    { key: "updatedAt", header: "Updated", sortable: true, hideBelow: "lg", render: (p) => formatDate(p.updatedAt) },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Products"
        description="Manage your catalog, pricing, and inventory."
        actions={
          <Button as="a" href="/admin/products/new" variant="primary" size="sm">
            <Plus className="h-4 w-4" /> Add product
          </Button>
        }
      />

      <Panel padded={false}>
        <div className="px-4 pt-4 sm:px-6 sm:pt-5">
          <Tabs tabs={STATUS_TABS} value={status} onChange={setStatus} />
        </div>
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--admin-border)] px-4 py-3 sm:px-6">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by title or SKU" className="max-w-xs" />
        </div>

        {selected.size > 0 && (
          <div className="px-4 pt-3 sm:px-6">
            <BulkActionBar
              count={selected.size}
              onClear={() => setSelected(new Set())}
              actions={
                <>
                  <Button size="sm" variant="secondary" onClick={() => handleBulkStatus("active")}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Set active
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleBulkStatus("archived")}>
                    <Archive className="h-3.5 w-3.5" /> Archive
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
          onRowClick={(row) => router.push(`/admin/products/${row.id}`)}
          loading={!mounted || loading}
          error={error && <ErrorState title="Unable to load products" onRetry={() => setRefreshKey((k) => k + 1)} />}
          empty={
            <EmptyState
              icon={Package}
              title={search ? "No products match your search" : "No products yet"}
              description={search ? "Try a different title or SKU." : "Start building your catalog by adding your first product."}
              action={
                !search && (
                  <Button as="a" href="/admin/products/new" variant="primary" size="sm">
                    <Plus className="h-4 w-4" /> Add product
                  </Button>
                )
              }
            />
          }
          renderMobileCard={(p) => (
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 shrink-0 overflow-hidden">
                <PlaceholderImage tone={p.images[0]?.tone ?? 0} alt={p.title} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--admin-text)]">{p.title}</p>
                <p className="text-xs text-[var(--admin-text-muted)]">{formatCurrency(p.price)} · {p.quantity} in stock</p>
              </div>
              <StatusBadge status={p.status} />
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
