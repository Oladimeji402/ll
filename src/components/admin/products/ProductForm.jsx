"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import Panel, { PanelHeader } from "@/components/admin/ui/Panel";
import Field from "@/components/admin/ui/form/Field";
import Input from "@/components/admin/ui/form/Input";
import Textarea from "@/components/admin/ui/form/Textarea";
import Select from "@/components/admin/ui/form/Select";
import Checkbox from "@/components/admin/ui/form/Checkbox";
import FileDrop from "@/components/admin/ui/FileDrop";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { slugify } from "@/lib/utils";
import { productFormSchema, PRODUCT_STATUSES } from "@/lib/admin/types/product";
import { SIZES, COLORS } from "@/lib/admin/mock-data/fixtures";
import { getCategories } from "@/lib/admin/services/product-service";
import { useCollectionsStore } from "@/lib/admin/store/collections-store";
import { generateId } from "@/lib/admin/utils/id";

export default function ProductForm({ defaultValues, formId, onValidSubmit, onDirtyChange }) {
  const collections = useCollectionsStore((s) => s.items);
  const slugTouched = useRef(defaultValues.slug !== "");
  const [categories, setCategories] = useState([]);

  useEffect(() => setCategories(getCategories()), []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm({ resolver: zodResolver(productFormSchema), defaultValues });

  const title = watch("title");
  const images = watch("images");
  const sizes = watch("sizes");
  const colors = watch("colors");
  const collectionIds = watch("collectionIds");

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (!slugTouched.current) setValue("slug", slugify(title || ""));
  }, [title, setValue]);

  function toggleInArray(field, value, current) {
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setValue(field, next, { shouldValidate: true, shouldDirty: true });
  }

  function handleFiles(files) {
    const next = [
      ...images,
      ...files.map((file, i) => ({ id: generateId("img"), tone: (images.length + i) % 5, alt: file.name })),
    ];
    setValue("images", next, { shouldValidate: true, shouldDirty: true });
  }

  function removeImage(id) {
    setValue("images", images.filter((img) => img.id !== id), { shouldValidate: true, shouldDirty: true });
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onValidSubmit)} className="contents">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Panel>
          <PanelHeader title="Basic information" />
          <div className="flex flex-col gap-4">
            <Field label="Title" required error={errors.title?.message}>
              <Input {...register("title")} placeholder="e.g. Silk Wrap Dress" error={!!errors.title} />
            </Field>
            <Field label="Description" hint="Fabric, fit, and styling notes.">
              <Textarea {...register("description")} rows={5} placeholder="Describe this product…" />
            </Field>
            <Field label="Slug" required hint="Used in the storefront URL." error={errors.slug?.message}>
              <Input
                {...register("slug")}
                onChange={(e) => {
                  slugTouched.current = true;
                  setValue("slug", e.target.value, { shouldDirty: true });
                }}
                error={!!errors.slug}
              />
            </Field>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Media" description="Upload product photography." />
          <FileDrop onFiles={handleFiles} />
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((img) => (
                <div key={img.id} className="group relative aspect-square overflow-hidden">
                  <PlaceholderImage tone={img.tone} alt={img.alt} />
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    aria-label="Remove image"
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {errors.images && <p className="mt-2 text-xs text-[var(--admin-danger)]">{errors.images.message}</p>}
        </Panel>

        <Panel>
          <PanelHeader title="Pricing" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Price (₦)" required error={errors.price?.message}>
              <Input type="number" step="1" {...register("price")} error={!!errors.price} />
            </Field>
            <Field label="Compare-at price (₦)" hint="Shown crossed out for a sale price.">
              <Input type="number" step="1" {...register("compareAtPrice")} />
            </Field>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Inventory" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="SKU" required error={errors.sku?.message}>
              <Input {...register("sku")} error={!!errors.sku} />
            </Field>
            <Field label="Quantity" required error={errors.quantity?.message}>
              <Input type="number" {...register("quantity")} error={!!errors.quantity} />
            </Field>
            <Field label="Low-stock threshold">
              <Input type="number" {...register("lowStockThreshold")} />
            </Field>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Variants" description="Sizes and colors this product comes in." />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium text-[var(--admin-text)]">Sizes</p>
              <div className="flex flex-wrap gap-3">
                {SIZES.map((size) => (
                  <Checkbox key={size} label={size} checked={sizes.includes(size)} onChange={() => toggleInArray("sizes", size, sizes)} />
                ))}
              </div>
              {errors.sizes && <p className="mt-2 text-xs text-[var(--admin-danger)]">{errors.sizes.message}</p>}
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-[var(--admin-text)]">Colors</p>
              <div className="flex flex-wrap gap-3">
                {COLORS.map((color) => (
                  <Checkbox key={color} label={color} checked={colors.includes(color)} onChange={() => toggleInArray("colors", color, colors)} />
                ))}
              </div>
              {errors.colors && <p className="mt-2 text-xs text-[var(--admin-danger)]">{errors.colors.message}</p>}
            </div>
          </div>
        </Panel>
      </div>

      <div className="flex flex-col gap-6">
        <Panel>
          <PanelHeader title="Organization" />
          <div className="flex flex-col gap-4">
            <Field label="Category" required error={errors.category?.message}>
              <Select {...register("category")} error={!!errors.category}>
                <option value="">Select a category</option>
                {[...new Set([...categories, "Dresses", "Outerwear", "Co-ord Sets", "Accessories"])].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <div>
              <p className="mb-2 text-sm font-medium text-[var(--admin-text)]">Collections</p>
              <div className="flex flex-col gap-2">
                {collections.map((c) => (
                  <Checkbox
                    key={c.id}
                    label={c.title}
                    checked={collectionIds.includes(c.id)}
                    onChange={() => toggleInArray("collectionIds", c.id, collectionIds)}
                  />
                ))}
              </div>
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Search engine listing" />
          <div className="flex flex-col gap-4">
            <Field label="SEO title" hint="Defaults to the product title.">
              <Input {...register("seoTitle")} />
            </Field>
            <Field label="Meta description">
              <Textarea {...register("seoDescription")} rows={3} />
            </Field>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Publishing" />
          <Field label="Status">
            <Select {...register("status")}>
              {PRODUCT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s[0].toUpperCase() + s.slice(1)}
                </option>
              ))}
            </Select>
          </Field>
        </Panel>
      </div>
    </form>
  );
}
