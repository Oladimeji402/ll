"use client";

import Panel, { PanelHeader } from "@/components/admin/ui/Panel";
import Button from "@/components/admin/ui/Button";
import Field from "@/components/admin/ui/form/Field";
import Input from "@/components/admin/ui/form/Input";
import Skeleton from "@/components/admin/ui/Skeleton";
import { useSettingsSection } from "@/components/admin/settings/use-settings-section";

export default function EmailSettingsPage() {
  const { value, patch, save, saving, loading } = useSettingsSection("email");

  if (loading || !value) return <Skeleton className="h-64 w-full" />;

  return (
    <Panel>
      <PanelHeader title="Email" description="How your store's emails are sent." actions={<Button variant="primary" size="sm" loading={saving} onClick={save}>Save</Button>} />
      <div className="flex flex-col gap-4">
        <Field label="Sender name" required>
          <Input value={value.senderName} onChange={(e) => patch({ senderName: e.target.value })} />
        </Field>
        <Field label="Sender email" required>
          <Input type="email" value={value.senderEmail} onChange={(e) => patch({ senderEmail: e.target.value })} />
        </Field>
        <Field label="Reply-to email" required>
          <Input type="email" value={value.replyTo} onChange={(e) => patch({ replyTo: e.target.value })} />
        </Field>
      </div>
      <p className="mt-5 border-t border-[var(--admin-border)] pt-4 text-xs text-[var(--admin-text-muted)]">
        Transactional email delivery will be connected once a provider is wired up alongside Supabase.
      </p>
    </Panel>
  );
}
