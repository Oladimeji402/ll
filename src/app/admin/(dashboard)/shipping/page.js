"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Panel, { PanelHeader } from "@/components/admin/ui/Panel";
import Button from "@/components/admin/ui/Button";
import Field from "@/components/admin/ui/form/Field";
import Input from "@/components/admin/ui/form/Input";
import Modal from "@/components/admin/ui/Modal";
import Skeleton from "@/components/admin/ui/Skeleton";
import { useToast } from "@/components/admin/ui/Toast";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { formatCurrency } from "@/lib/admin/utils/format";
import {
  getShippingConfig,
  updateFreeShippingThreshold,
  addShippingMethod,
  removeShippingMethod,
} from "@/lib/admin/services/shipping-service";

export default function ShippingPage() {
  const mounted = useMounted();
  const toast = useToast();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(0);
  const [modalZone, setModalZone] = useState(null);
  const [methodForm, setMethodForm] = useState({ name: "", rate: 0, estimateDays: "" });
  const [saving, setSaving] = useState(false);

  async function refresh() {
    const c = await getShippingConfig();
    setConfig(c);
    setThreshold(c.freeShippingThreshold);
    setLoading(false);
  }

  useEffect(() => {
    if (!mounted) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  async function handleSaveThreshold() {
    setSaving(true);
    try {
      await updateFreeShippingThreshold(Number(threshold));
      toast({ title: "Free shipping threshold updated" });
      refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleAddMethod() {
    setSaving(true);
    try {
      await addShippingMethod(modalZone.id, methodForm);
      toast({ title: "Shipping method added" });
      setModalZone(null);
      setMethodForm({ name: "", rate: 0, estimateDays: "" });
      refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveMethod(zoneId, methodId) {
    await removeShippingMethod(zoneId, methodId);
    toast({ title: "Shipping method removed", variant: "info" });
    refresh();
  }

  if (!mounted || loading || !config) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Shipping" description="Configure delivery zones, rates, and free shipping." />

      <Panel>
        <PanelHeader title="Free shipping threshold" description="Orders above this amount ship free." />
        <div className="flex max-w-xs items-end gap-3">
          <Field label="Amount (₦)" className="flex-1">
            <Input type="number" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
          </Field>
          <Button variant="primary" size="md" loading={saving} onClick={handleSaveThreshold}>Save</Button>
        </div>
      </Panel>

      {config.zones.map((zone) => (
        <Panel key={zone.id} padded={false}>
          <PanelHeader
            title={zone.name}
            description={zone.regions.join(", ")}
            className="px-5 pt-5 sm:px-6"
            actions={
              <Button size="sm" variant="secondary" onClick={() => setModalZone(zone)}>
                <Plus className="h-3.5 w-3.5" /> Add method
              </Button>
            }
          />
          <ul className="divide-y divide-[var(--admin-border)]">
            {zone.methods.map((method) => (
              <li key={method.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm sm:px-6">
                <div>
                  <p className="text-[var(--admin-text)]">{method.name}</p>
                  <p className="text-xs text-[var(--admin-text-muted)]">{method.estimateDays}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-medium text-[var(--admin-text)]">{formatCurrency(method.rate)}</p>
                  <button type="button" onClick={() => handleRemoveMethod(zone.id, method.id)} aria-label={`Remove ${method.name}`} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-danger)]">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      ))}

      <Modal
        open={!!modalZone}
        onClose={() => setModalZone(null)}
        title={`Add method to ${modalZone?.name}`}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setModalZone(null)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={saving} onClick={handleAddMethod}>Add method</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Method name" required>
            <Input value={methodForm.name} onChange={(e) => setMethodForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Express Delivery" />
          </Field>
          <Field label="Rate (₦)" required>
            <Input type="number" value={methodForm.rate} onChange={(e) => setMethodForm((f) => ({ ...f, rate: e.target.value }))} />
          </Field>
          <Field label="Delivery estimate" required>
            <Input value={methodForm.estimateDays} onChange={(e) => setMethodForm((f) => ({ ...f, estimateDays: e.target.value }))} placeholder="e.g. 3–5 days" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
