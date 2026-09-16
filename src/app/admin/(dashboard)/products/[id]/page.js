"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Panel, { PanelHeader } from "@/components/admin/ui/Panel";
import Button from "@/components/admin/ui/Button";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import Skeleton from "@/components/admin/ui/Skeleton";
import ErrorState from "@/components/admin/ui/ErrorState";
import ProductForm from "@/components/admin/products/ProductForm";
import { useToast } from "@/components/admin/ui/Toast";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { formatCurrency, formatDateTime, formatRelativeTime } from "@/lib/admin/utils/format";
import { getProduct, updateProduct, deleteProduct, getProductPerformance } from "@/lib/admin/services/product-service";
import { getActivityForResource } from "@/lib/admin/services/activity-service";

function toFormValues(product) {
  return {
    title: product.title,
    description: product.description,
    slug: product.slug,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    category: product.category,
    collectionIds: product.collectionIds,
    tags: product.tags,
    sizes: product.sizes,
    colors: product.colors,
    sku: product.sku,
    quantity: product.quantity,
    lowStockThreshold: product.lowStockThreshold,
    status: product.status,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    images: product.images,
  };
}

export default function ProductDetailPage({ params }) {
  const { id } = use(params);
  const mounted = useMounted();
  const router = useRouter();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    getProduct(id).then(async (p) => {
      if (cancelled) return;
      if (!p) {
        setError(true);
        setLoading(false);
        return;
      }
      setProduct(p);
      const perf = await getProductPerformance(id);
      if (cancelled) return;
      setPerformance(perf);
      setActivity(getActivityForResource(id));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [mounted, id]);

  async function handleSubmit(values) {
    setSubmitting(true);
    try {
      const updated = await updateProduct(id, values);
      setProduct(updated);
      setActivity(getActivityForResource(id));
      toast({ title: "Product saved" });
      setDirty(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    await deleteProduct(id);
    toast({ title: "Product deleted", variant: "info" });
    router.push("/admin/products");
  }

  if (!mounted || loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !product) {
    return <ErrorState title="Product not found" description="This product may have been removed." onRetry={() => router.push("/admin/products")} />;
  }

  return (
    <div className="flex flex-col gap-5 pb-16">
      <Link href="/admin/products" className="flex w-fit items-center gap-1.5 text-sm text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>

      <PageHeader
        title={product.title}
        description={`SKU ${product.sku} · Updated ${formatRelativeTime(product.updatedAt)}`}
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
            <Button type="submit" form="product-form" variant="primary" size="sm" loading={submitting} disabled={!dirty}>
              Save changes
            </Button>
          </>
        }
      />

      <Panel>
        <PanelHeader title="Sales performance" />
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-semibold tabular-nums text-[var(--admin-text)]">{performance?.unitsSold ?? 0}</p>
            <p className="text-xs text-[var(--admin-text-muted)]">Units sold</p>
          </div>
          <div>
            <p className="truncate text-xl font-semibold tabular-nums text-[var(--admin-text)]">{formatCurrency(performance?.revenue ?? 0)}</p>
            <p className="text-xs text-[var(--admin-text-muted)]">Revenue</p>
          </div>
          <div>
            <p className="text-xl font-semibold tabular-nums text-[var(--admin-text)]">{product.quantity}</p>
            <p className="text-xs text-[var(--admin-text-muted)]">Current inventory</p>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ProductForm formId="product-form" defaultValues={toFormValues(product)} onValidSubmit={handleSubmit} onDirtyChange={setDirty} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel padded={false}>
          <PanelHeader title="Recent orders" className="px-5 pt-5 sm:px-6" />
          {performance?.recentOrders?.length ? (
            <div className="divide-y divide-[var(--admin-border)]">
              {performance.recentOrders.map((order) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between px-5 py-3 text-sm hover:bg-[var(--admin-surface-alt)] sm:px-6">
                  <span className="text-[var(--admin-text)]">{order.orderNumber}</span>
                  <span className="text-[var(--admin-text-muted)]">{formatDateTime(order.createdAt)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="px-5 pb-5 text-sm text-[var(--admin-text-muted)] sm:px-6">No orders yet for this product.</p>
          )}
        </Panel>

        <Panel padded={false}>
          <PanelHeader title="Activity" className="px-5 pt-5 sm:px-6" />
          {activity.length ? (
            <ul className="divide-y divide-[var(--admin-border)]">
              {activity.map((entry) => (
                <li key={entry.id} className="px-5 py-3 text-sm sm:px-6">
                  <p className="text-[var(--admin-text)]">{entry.details}</p>
                  <p className="text-xs text-[var(--admin-text-muted)]">{entry.actor} · {formatRelativeTime(entry.timestamp)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 pb-5 text-sm text-[var(--admin-text-muted)] sm:px-6">No activity recorded yet.</p>
          )}
        </Panel>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete product?"
        description={`"${product.title}" will be permanently removed.`}
        confirmLabel="Delete product"
      />
    </div>
  );
}
