"use client";

import { useEffect, useState } from "react";
import { Boxes, Plus, Minus } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Panel from "@/components/admin/ui/Panel";
import Tabs from "@/components/admin/ui/Tabs";
import SearchInput from "@/components/admin/ui/SearchInput";
import DataTable from "@/components/admin/ui/DataTable";
import Badge from "@/components/admin/ui/Badge";
import Button from "@/components/admin/ui/Button";
import Drawer from "@/components/admin/ui/Drawer";
import Modal from "@/components/admin/ui/Modal";
import Field from "@/components/admin/ui/form/Field";
import Input from "@/components/admin/ui/form/Input";
import Select from "@/components/admin/ui/form/Select";
import Textarea from "@/components/admin/ui/form/Textarea";
import EmptyState from "@/components/admin/ui/EmptyState";
import ErrorState from "@/components/admin/ui/ErrorState";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { formatDateTime } from "@/lib/admin/utils/format";
import { inventoryStatus, STOCK_REASONS } from "@/lib/admin/types/inventory";
import { listInventory, getInventoryCounts, getInventoryItem, adjustStock } from "@/lib/admin/services/inventory-service";
import { useToast } from "@/components/admin/ui/Toast";

const VIEWS = [
  { value: "all", label: "All" },
  { value: "in-stock", label: "In Stock" },
  { value: "low-stock", label: "Low Stock" },
  { value: "out-of-stock", label: "Out of Stock" },
];

export default function InventoryPage() {
  const mounted = useMounted();
  const toast = useToast();

  const [view, setView] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeItem, setActiveItem] = useState(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState({ direction: "increase", quantity: 1, reason: "restock", note: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => setPage(1), [view, search]);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    listInventory({ search, view, page, pageSize: 10 })
      .then(async (res) => {
        if (cancelled) return;
        setResult(res);
        const counts = await getInventoryCounts();
        if (cancelled) return;
        setCounts(counts);
        setLoading(false);
      })
      .catch(() => !cancelled && (setError(true), setLoading(false)));
    return () => {
      cancelled = true;
    };
  }, [mounted, search, view, page, refreshKey]);

  const tabs = VIEWS.map((v) => ({ ...v, count: counts?.[v.value] }));

  async function handleAdjust() {
    setSaving(true);
    try {
      const updated = await adjustStock(activeItem.id, adjustForm);
      toast({ title: "Inventory adjusted", description: `${updated.productTitle} now has ${updated.available} available.` });
      setActiveItem(updated);
      setAdjustOpen(false);
      setAdjustForm({ direction: "increase", quantity: 1, reason: "restock", note: "" });
      setRefreshKey((k) => k + 1);
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    {
      key: "productTitle",
      header: "Product",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden">
            <PlaceholderImage tone={item.tone} alt={item.productTitle} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-[var(--admin-text)]">{item.productTitle}</p>
            <p className="truncate text-xs text-[var(--admin-text-muted)]">{item.sku}</p>
          </div>
        </div>
      ),
    },
    { key: "available", header: "Available", sortable: true },
    { key: "reserved", header: "Reserved", hideBelow: "md" },
    { key: "total", header: "Total", hideBelow: "md" },
    { key: "lowStockThreshold", header: "Threshold", hideBelow: "lg" },
    {
      key: "status",
      header: "Status",
      render: (item) => {
        const status = inventoryStatus(item);
        return <Badge tone={status === "in-stock" ? "success" : status === "low-stock" ? "warning" : "danger"}>{status.replace("-", " ")}</Badge>;
      },
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Inventory" description="Track stock levels across your catalog." />

      <Panel padded={false}>
        <div className="px-4 pt-4 sm:px-6 sm:pt-5">
          <Tabs tabs={tabs} value={view} onChange={setView} />
        </div>
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--admin-border)] px-4 py-3 sm:px-6">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by product or SKU" className="max-w-xs" />
        </div>

        <DataTable
          columns={columns}
          rows={result?.items ?? []}
          onRowClick={(row) => getInventoryItem(row.id).then(setActiveItem)}
          loading={!mounted || loading}
          error={error && <ErrorState title="Unable to load inventory" onRetry={() => setRefreshKey((k) => k + 1)} />}
          empty={<EmptyState icon={Boxes} title="No inventory items" description="Products will appear here once added to your catalog." />}
          renderMobileCard={(item) => {
            const status = inventoryStatus(item);
            return (
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 shrink-0 overflow-hidden">
                  <PlaceholderImage tone={item.tone} alt={item.productTitle} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--admin-text)]">{item.productTitle}</p>
                  <p className="text-xs text-[var(--admin-text-muted)]">{item.available} available</p>
                </div>
                <Badge tone={status === "in-stock" ? "success" : status === "low-stock" ? "warning" : "danger"}>{status.replace("-", " ")}</Badge>
              </div>
            );
          }}
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

      <Drawer
        open={!!activeItem}
        onClose={() => setActiveItem(null)}
        title={activeItem?.productTitle}
        description={activeItem?.sku}
        footer={
          <Button variant="primary" size="sm" onClick={() => setAdjustOpen(true)}>
            Adjust stock
          </Button>
        }
      >
        {activeItem && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="border border-[var(--admin-border)] p-3">
                <p className="text-lg font-semibold tabular-nums text-[var(--admin-text)]">{activeItem.available}</p>
                <p className="text-xs text-[var(--admin-text-muted)]">Available</p>
              </div>
              <div className="border border-[var(--admin-border)] p-3">
                <p className="text-lg font-semibold tabular-nums text-[var(--admin-text)]">{activeItem.reserved}</p>
                <p className="text-xs text-[var(--admin-text-muted)]">Reserved</p>
              </div>
              <div className="border border-[var(--admin-border)] p-3">
                <p className="text-lg font-semibold tabular-nums text-[var(--admin-text)]">{activeItem.total}</p>
                <p className="text-xs text-[var(--admin-text-muted)]">Total</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">History</p>
              <ul className="flex flex-col gap-3">
                {[...activeItem.history].reverse().map((entry) => (
                  <li key={entry.id} className="flex items-start justify-between gap-3 border-b border-[var(--admin-border)] pb-3 text-sm">
                    <div>
                      <p className="text-[var(--admin-text)] capitalize">{entry.reason}</p>
                      <p className="text-xs text-[var(--admin-text-muted)]">{entry.note}</p>
                      <p className="text-xs text-[var(--admin-text-muted)]">{entry.actor} · {formatDateTime(entry.date)}</p>
                    </div>
                    <span className={`shrink-0 text-sm font-medium ${entry.change > 0 ? "text-[var(--admin-success)]" : "text-[var(--admin-danger)]"}`}>
                      {entry.change > 0 ? "+" : ""}{entry.change}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Drawer>

      <Modal
        open={adjustOpen}
        onClose={() => setAdjustOpen(false)}
        title="Adjust stock"
        description={activeItem?.productTitle}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setAdjustOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={saving} onClick={handleAdjust}>Save adjustment</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex border border-[var(--admin-border)]">
            <button
              type="button"
              onClick={() => setAdjustForm((f) => ({ ...f, direction: "increase" }))}
              className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-sm ${adjustForm.direction === "increase" ? "bg-[var(--color-primary)] text-white" : "text-[var(--admin-text-muted)]"}`}
            >
              <Plus className="h-3.5 w-3.5" /> Increase
            </button>
            <button
              type="button"
              onClick={() => setAdjustForm((f) => ({ ...f, direction: "decrease" }))}
              className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-sm ${adjustForm.direction === "decrease" ? "bg-[var(--color-primary)] text-white" : "text-[var(--admin-text-muted)]"}`}
            >
              <Minus className="h-3.5 w-3.5" /> Decrease
            </button>
          </div>
          <Field label="Quantity" required>
            <Input type="number" min="1" value={adjustForm.quantity} onChange={(e) => setAdjustForm((f) => ({ ...f, quantity: e.target.value }))} />
          </Field>
          <Field label="Reason" required>
            <Select value={adjustForm.reason} onChange={(e) => setAdjustForm((f) => ({ ...f, reason: e.target.value }))}>
              {STOCK_REASONS.map((r) => (
                <option key={r} value={r} className="capitalize">{r}</option>
              ))}
            </Select>
          </Field>
          <Field label="Note">
            <Textarea rows={2} value={adjustForm.note} onChange={(e) => setAdjustForm((f) => ({ ...f, note: e.target.value }))} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
