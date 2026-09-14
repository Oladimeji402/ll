"use client";

import Panel, { PanelHeader } from "@/components/admin/ui/Panel";
import Button from "@/components/admin/ui/Button";
import Switch from "@/components/admin/ui/form/Switch";
import Skeleton from "@/components/admin/ui/Skeleton";
import { useSettingsSection } from "@/components/admin/settings/use-settings-section";

export default function NotificationSettingsPage() {
  const { value, patch, save, saving, loading } = useSettingsSection("notifications");

  if (loading || !value) return <Skeleton className="h-64 w-full" />;

  return (
    <Panel>
      <PanelHeader title="Notification preferences" description="Choose which events trigger a notification." actions={<Button variant="primary" size="sm" loading={saving} onClick={save}>Save</Button>} />
      <div className="flex flex-col gap-5">
        <Switch label="New order" description="Notify when a new order is placed." checked={value.emailOnNewOrder} onChange={(v) => patch({ emailOnNewOrder: v })} />
        <Switch label="Low stock" description="Notify when a product falls below its threshold." checked={value.emailOnLowStock} onChange={(v) => patch({ emailOnLowStock: v })} />
        <Switch label="Return requested" description="Notify when a customer requests a return." checked={value.emailOnReturn} onChange={(v) => patch({ emailOnReturn: v })} />
        <Switch label="SMS on shipment" description="Send a text message when an order ships." checked={value.smsOnShipment} onChange={(v) => patch({ smsOnShipment: v })} />
      </div>
    </Panel>
  );
}
