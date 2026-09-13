"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Button from "@/components/admin/ui/Button";
import { useToast } from "@/components/admin/ui/Toast";
import ProductForm from "@/components/admin/products/ProductForm";
import { productDefaults } from "@/lib/admin/types/product";
import { createProduct } from "@/lib/admin/services/product-service";

export default function NewProductPage() {
  const router = useRouter();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values) {
    setSubmitting(true);
    try {
      const product = await createProduct(values);
      toast({ title: "Product created", description: product.title });
      router.push(`/admin/products/${product.id}`);
    } catch {
      toast({ title: "Couldn't create product", variant: "error" });
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 pb-16">
      <Link href="/admin/products" className="flex w-fit items-center gap-1.5 text-sm text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>

      <PageHeader
        title="Add product"
        description="Create a new product for your catalog."
        actions={
          <>
            <Button as={Link} href="/admin/products" variant="ghost" size="sm">Discard</Button>
            <Button type="submit" form="product-form" variant="primary" size="sm" loading={submitting}>Save product</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ProductForm formId="product-form" defaultValues={productDefaults} onValidSubmit={handleSubmit} />
      </div>
    </div>
  );
}
