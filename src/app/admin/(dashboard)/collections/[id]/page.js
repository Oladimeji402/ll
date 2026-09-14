"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, GripVertical, Plus, Trash2, X } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Panel, { PanelHeader } from "@/components/admin/ui/Panel";
import Button from "@/components/admin/ui/Button";
import Field from "@/components/admin/ui/form/Field";
import Input from "@/components/admin/ui/form/Input";
import Textarea from "@/components/admin/ui/form/Textarea";
import Switch from "@/components/admin/ui/form/Switch";
import Modal from "@/components/admin/ui/Modal";
import Checkbox from "@/components/admin/ui/form/Checkbox";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import Skeleton from "@/components/admin/ui/Skeleton";
import ErrorState from "@/components/admin/ui/ErrorState";
import SearchInput from "@/components/admin/ui/SearchInput";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { useToast } from "@/components/admin/ui/Toast";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { formatCurrency } from "@/lib/admin/utils/format";
import {
  getCollection,
  getCollectionProducts,
  updateCollection,
  deleteCollection,
  reorderCollectionProducts,
  addProductToCollection,
  removeProductFromCollection,
} from "@/lib/admin/services/collection-service";
import { useProductsStore } from "@/lib/admin/store/products-store";

export default function CollectionDetailPage({ params }) {
  const { id } = use(params);
  const mounted = useMounted();
  const router = useRouter();
  const toast = useToast();
  const allProducts = useProductsStore((s) => s.items);

  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [dragIndex, setDragIndex] = useState(null);

  async function refresh() {
    const c = await getCollection(id);
    if (!c) {
      setError(true);
      setLoading(false);
      return;
    }
    setCollection(c);
    setForm({ title: c.title, description: c.description, status: c.status, seoTitle: c.seoTitle, seoDescription: c.seoDescription });
    setProducts(getCollectionProducts(id));
    setLoading(false);
  }

  useEffect(() => {
    if (!mounted) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, id]);

  async function handleSave() {
    setSaving(true);
    try {
      await updateCollection(id, form);
      toast({ title: "Collection saved" });
      refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    await deleteCollection(id);
    toast({ title: "Collection deleted", variant: "info" });
    router.push("/admin/collections");
  }

  function handleDrop(targetIndex) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...products];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setProducts(next);
    setDragIndex(null);
    reorderCollectionProducts(id, next.map((p) => p.id));
  }

  async function handleAddProduct(productId) {
    await addProductToCollection(id, productId);
    refresh();
  }

  async function handleRemoveProduct(productId) {
    await removeProductFromCollection(id, productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }

  if (!mounted || loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !collection) {
    return <ErrorState title="Collection not found" onRetry={() => router.push("/admin/collections")} />;
  }

  const availableToAdd = allProducts.filter(
    (p) => !collection.productIds.includes(p.id) && p.title.toLowerCase().includes(addSearch.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-5 pb-16">
      <Link href="/admin/collections" className="flex w-fit items-center gap-1.5 text-sm text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]">
        <ArrowLeft className="h-4 w-4" /> Back to collections
      </Link>

      <PageHeader
        title={collection.title}
        description={`${products.length} products`}
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
            <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>Save changes</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Panel>
            <PanelHeader title="Details" />
            <div className="flex flex-col gap-4">
              <Field label="Title" required>
                <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </Field>
              <Field label="Description">
                <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4} />
              </Field>
            </div>
          </Panel>

          <Panel padded={false}>
            <PanelHeader
              title="Products"
              description="Drag to reorder how products appear on the storefront."
              className="px-5 pt-5 sm:px-6"
              actions={
                <Button size="sm" variant="secondary" onClick={() => setAddOpen(true)}>
                  <Plus className="h-3.5 w-3.5" /> Add products
                </Button>
              }
            />
            {products.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-[var(--admin-text-muted)] sm:px-6">No products in this collection yet.</p>
            ) : (
              <ul className="divide-y divide-[var(--admin-border)]">
                {products.map((product, index) => (
                  <li
                    key={product.id}
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(index)}
                    className="flex items-center gap-3 px-5 py-3 sm:px-6"
                  >
                    <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-[var(--admin-text-muted)]" />
                    <div className="h-10 w-10 shrink-0 overflow-hidden">
                      <PlaceholderImage tone={product.images[0]?.tone ?? 0} alt={product.title} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/admin/products/${product.id}`} className="truncate text-sm text-[var(--admin-text)] hover:text-[var(--color-primary)]">
                        {product.title}
                      </Link>
                      <p className="text-xs text-[var(--admin-text-muted)]">{formatCurrency(product.price)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(product.id)}
                      aria-label={`Remove ${product.title}`}
                      className="text-[var(--admin-text-muted)] hover:text-[var(--admin-danger)]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel>
            <PanelHeader title="Search engine listing" />
            <div className="flex flex-col gap-4">
              <Field label="SEO title">
                <Input value={form.seoTitle} onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))} />
              </Field>
              <Field label="Meta description">
                <Textarea value={form.seoDescription} onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))} rows={3} />
              </Field>
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel>
            <PanelHeader title="Image" />
            <div className="aspect-square overflow-hidden">
              <PlaceholderImage tone={collection.tone} alt={collection.title} />
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Visibility" />
            <Switch
              label="Visible on storefront"
              description="Hidden collections aren't shown to customers."
              checked={form.status === "visible"}
              onChange={(checked) => setForm((f) => ({ ...f, status: checked ? "visible" : "hidden" }))}
            />
          </Panel>
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add products" size="lg">
        <SearchInput value={addSearch} onChange={setAddSearch} placeholder="Search products" className="mb-4" />
        <div className="flex max-h-80 flex-col divide-y divide-[var(--admin-border)] overflow-y-auto">
          {availableToAdd.length === 0 && <p className="py-6 text-center text-sm text-[var(--admin-text-muted)]">No products found.</p>}
          {availableToAdd.map((product) => (
            <label key={product.id} className="flex cursor-pointer items-center gap-3 py-2.5">
              <Checkbox onChange={() => handleAddProduct(product.id)} />
              <div className="h-9 w-9 shrink-0 overflow-hidden">
                <PlaceholderImage tone={product.images[0]?.tone ?? 0} alt={product.title} />
              </div>
              <span className="min-w-0 flex-1 truncate text-sm text-[var(--admin-text)]">{product.title}</span>
              <span className="shrink-0 text-xs text-[var(--admin-text-muted)]">{formatCurrency(product.price)}</span>
            </label>
          ))}
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete collection?"
        description={`"${collection.title}" will be permanently removed.`}
        confirmLabel="Delete collection"
      />
    </div>
  );
}
