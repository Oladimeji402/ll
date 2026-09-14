"use client";

import Panel, { PanelHeader } from "@/components/admin/ui/Panel";
import Button from "@/components/admin/ui/Button";
import Switch from "@/components/admin/ui/form/Switch";
import Skeleton from "@/components/admin/ui/Skeleton";
import { PAYMENT_METHODS } from "@/lib/admin/types/payment";
import { useSettingsSection } from "@/components/admin/settings/use-settings-section";

export default function PaymentsSettingsPage() {
  const { value, patch, save, saving, loading } = useSettingsSection("payments");

  if (loading || !value) return <Skeleton className="h-64 w-full" />;

  function toggleMethod(method) {
    const enabled = value.methodsEnabled.includes(method)
      ? value.methodsEnabled.filter((m) => m !== method)
      : [...value.methodsEnabled, method];
    patch({ methodsEnabled: enabled });
  }

  return (
    <Panel>
      <PanelHeader title="Payment methods" description="Choose which payment methods customers can use." actions={<Button variant="primary" size="sm" loading={saving} onClick={save}>Save</Button>} />
      <div className="flex flex-col gap-4">
        {PAYMENT_METHODS.map((method) => (
          <Switch key={method} label={method} checked={value.methodsEnabled.includes(method)} onChange={() => toggleMethod(method)} />
        ))}
      </div>
      <p className="mt-5 border-t border-[var(--admin-border)] pt-4 text-xs text-[var(--admin-text-muted)]">
        No payment credentials are stored here — gateway keys will be configured once Supabase and a payment provider are connected.
      </p>
    </Panel>
  );
}
