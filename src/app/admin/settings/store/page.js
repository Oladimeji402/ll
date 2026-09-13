"use client";

import Panel, { PanelHeader } from "@/components/admin/ui/Panel";
import Button from "@/components/admin/ui/Button";
import Field from "@/components/admin/ui/form/Field";
import Input from "@/components/admin/ui/form/Input";
import Select from "@/components/admin/ui/form/Select";
import Skeleton from "@/components/admin/ui/Skeleton";
import { useSettingsSection } from "@/components/admin/settings/use-settings-section";

export default function StoreSettingsPage() {
  const { value, patch, save, saving, loading } = useSettingsSection("store");

  if (loading || !value) return <Skeleton className="h-80 w-full" />;

  return (
    <Panel>
      <PanelHeader title="Store details" description="Shown on receipts, emails, and your storefront." actions={<Button variant="primary" size="sm" loading={saving} onClick={save}>Save</Button>} />
      <div className="flex flex-col gap-4">
        <Field label="Store name" required>
          <Input value={value.name} onChange={(e) => patch({ name: e.target.value })} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Support email" required>
            <Input type="email" value={value.supportEmail} onChange={(e) => patch({ supportEmail: e.target.value })} />
          </Field>
          <Field label="Support phone" required>
            <Input value={value.supportPhone} onChange={(e) => patch({ supportPhone: e.target.value })} />
          </Field>
        </div>
        <Field label="Address" required>
          <Input value={value.address} onChange={(e) => patch({ address: e.target.value })} />
        </Field>
        <Field label="Currency">
          <Select value={value.currency} onChange={(e) => patch({ currency: e.target.value })}>
            <option value="NGN">NGN — Nigerian Naira</option>
            <option value="USD">USD — US Dollar</option>
            <option value="GBP">GBP — British Pound</option>
          </Select>
        </Field>
      </div>
    </Panel>
  );
}
