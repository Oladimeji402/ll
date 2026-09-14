"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Button from "@/components/admin/ui/Button";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import Skeleton from "@/components/admin/ui/Skeleton";
import ErrorState from "@/components/admin/ui/ErrorState";
import { useToast } from "@/components/admin/ui/Toast";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import DiscountForm from "@/components/admin/discounts/DiscountForm";
import { getDiscount, updateDiscount, deleteDiscount } from "@/lib/admin/services/discount-service";

export default function DiscountDetailPage({ params }) {
  const { id } = use(params);
  const mounted = useMounted();
  const router = useRouter();
  const toast = useToast();

  const [discount, setDiscount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    getDiscount(id).then((d) => {
      if (!d) setError(true);
      else setDiscount(d);
      setLoading(false);
    });
  }, [mounted, id]);

  async function handleSubmit(values) {
    setSubmitting(true);
    try {
      const updated = await updateDiscount(id, values);
      setDiscount(updated);
      toast({ title: "Discount saved" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    await deleteDiscount(id);
    toast({ title: "Discount deleted", variant: "info" });
    router.push("/admin/discounts");
  }

  if (!mounted || loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !discount) {
    return <ErrorState title="Discount not found" onRetry={() => router.push("/admin/discounts")} />;
  }

  return (
    <div className="flex flex-col gap-5 pb-16">
      <Link href="/admin/discounts" className="flex w-fit items-center gap-1.5 text-sm text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]">
        <ArrowLeft className="h-4 w-4" /> Back to discounts
      </Link>

      <PageHeader
        title={discount.code}
        description={`Used ${discount.usageCount} time${discount.usageCount === 1 ? "" : "s"}`}
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
            <Button type="submit" form="discount-form" variant="primary" size="sm" loading={submitting}>Save changes</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DiscountForm formId="discount-form" defaultValues={discount} onValidSubmit={handleSubmit} />
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete discount?"
        description={`"${discount.code}" will be permanently removed.`}
        confirmLabel="Delete discount"
      />
    </div>
  );
}
