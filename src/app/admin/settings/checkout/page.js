"use client";

import Panel, { PanelHeader } from "@/components/admin/ui/Panel";
import Button from "@/components/admin/ui/Button";
import Field from "@/components/admin/ui/form/Field";
import Input from "@/components/admin/ui/form/Input";
import Switch from "@/components/admin/ui/form/Switch";
import Skeleton from "@/components/admin/ui/Skeleton";
import { useSettingsSection } from "@/components/admin/settings/use-settings-section";

export default function CheckoutSettingsPage() {
  const { value, patch, save, saving, loading } = useSettingsSection("checkout");

  if (loading || !value) return <Skeleton className="h-64 w-full" />;

  return (
    <Panel>
      <PanelHeader title="Checkout" description="Control how customers check out." actions={<Button variant="primary" size="sm" loading={saving} onClick={save}>Save</Button>} />
      <div className="flex flex-col gap-5">
        <Switch label="Allow guest checkout" description="Customers can check out without creating an account." checked={value.guestCheckout} onChange={(v) => patch({ guestCheckout: v })} />
        <Switch label="Require phone number" description="Ask for a phone number at checkout." checked={value.requirePhone} onChange={(v) => patch({ requirePhone: v })} />
        <Field label="Terms & conditions URL">
          <Input value={value.termsUrl} onChange={(e) => patch({ termsUrl: e.target.value })} />
        </Field>
      </div>
    </Panel>
  );
}
