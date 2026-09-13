"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Panel, { PanelHeader } from "@/components/admin/ui/Panel";
import Field from "@/components/admin/ui/form/Field";
import Input from "@/components/admin/ui/form/Input";
import Select from "@/components/admin/ui/form/Select";
import Switch from "@/components/admin/ui/form/Switch";
import Checkbox from "@/components/admin/ui/form/Checkbox";
import { discountFormSchema, DISCOUNT_TYPES } from "@/lib/admin/types/discount";
import { useCollectionsStore } from "@/lib/admin/store/collections-store";
import { useProductsStore } from "@/lib/admin/store/products-store";

export default function DiscountForm({ defaultValues, formId, onValidSubmit }) {
  const collections = useCollectionsStore((s) => s.items);
  const products = useProductsStore((s) => s.items);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(discountFormSchema), defaultValues });

  const type = watch("type");
  const active = watch("active");
  const productIds = watch("productIds");
  const collectionIds = watch("collectionIds");

  function toggleInArray(field, value, current) {
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setValue(field, next, { shouldValidate: true });
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onValidSubmit)} className="contents">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Panel>
          <PanelHeader title="Discount code" />
          <div className="flex flex-col gap-4">
            <Field label="Code" required hint="Customers enter this at checkout." error={errors.code?.message}>
              <Input {...register("code")} placeholder="e.g. WELCOME10" className="uppercase" error={!!errors.code} />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Type">
                <Select {...register("type")}>
                  {DISCOUNT_TYPES.map((t) => (
                    <option key={t} value={t}>{t === "percentage" ? "Percentage" : "Fixed amount"}</option>
                  ))}
                </Select>
              </Field>
              <Field label={type === "percentage" ? "Percentage off" : "Amount off (₦)"} required error={errors.value?.message}>
                <Input type="number" {...register("value")} error={!!errors.value} />
              </Field>
            </div>
            <Field label="Minimum order amount (₦)" hint="Leave 0 for no minimum.">
              <Input type="number" {...register("minOrderAmount")} />
            </Field>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Restrictions" description="Leave empty to apply to all products." />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium text-[var(--admin-text)]">Collections</p>
              <div className="flex max-h-48 flex-col gap-2 overflow-y-auto">
                {collections.map((c) => (
                  <Checkbox key={c.id} label={c.title} checked={collectionIds.includes(c.id)} onChange={() => toggleInArray("collectionIds", c.id, collectionIds)} />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-[var(--admin-text)]">Products</p>
              <div className="flex max-h-48 flex-col gap-2 overflow-y-auto">
                {products.slice(0, 20).map((p) => (
                  <Checkbox key={p.id} label={p.title} checked={productIds.includes(p.id)} onChange={() => toggleInArray("productIds", p.id, productIds)} />
                ))}
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="flex flex-col gap-6">
        <Panel>
          <PanelHeader title="Active dates" />
          <div className="flex flex-col gap-4">
            <Field label="Start date" required error={errors.startDate?.message}>
              <Input type="date" {...register("startDate")} error={!!errors.startDate} />
            </Field>
            <Field label="End date" hint="Leave empty for no expiry.">
              <Input type="date" {...register("endDate")} />
            </Field>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Usage limit" />
          <Field label="Total uses" hint="Leave empty for unlimited.">
            <Input type="number" {...register("usageLimit")} />
          </Field>
        </Panel>

        <Panel>
          <PanelHeader title="Status" />
          <Switch label="Active" description="Inactive discounts can't be applied." checked={active} onChange={(v) => setValue("active", v)} />
        </Panel>
      </div>
    </form>
  );
}
