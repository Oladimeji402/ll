"use client";

import Link from "next/link";
import Panel, { PanelHeader } from "@/components/admin/ui/Panel";
import Button from "@/components/admin/ui/Button";
import Field from "@/components/admin/ui/form/Field";
import Select from "@/components/admin/ui/form/Select";
import Skeleton from "@/components/admin/ui/Skeleton";
import { useSettingsSection } from "@/components/admin/settings/use-settings-section";

export default function ShippingSettingsPage() {
  const { value, patch, save, saving, loading } = useSettingsSection("shipping");

  if (loading || !value) return <Skeleton className="h-56 w-full" />;

  return (
    <Panel>
      <PanelHeader title="Shipping" description="Default zone used when a customer's address doesn't match any zone." actions={<Button variant="primary" size="sm" loading={saving} onClick={save}>Save</Button>} />
      <Field label="Default shipping zone">
        <Select value={value.defaultZoneId ?? ""} onChange={(e) => patch({ defaultZoneId: e.target.value })}>
          {value.zones.map((z) => (
            <option key={z.id} value={z.id}>{z.name}</option>
          ))}
        </Select>
      </Field>
      <p className="mt-5 border-t border-[var(--admin-border)] pt-4 text-sm text-[var(--admin-text-muted)]">
        Manage zones, rates, and free shipping thresholds on the{" "}
        <Link href="/admin/shipping" className="text-[var(--color-primary)] hover:underline">Shipping</Link> page.
      </p>
    </Panel>
  );
}
