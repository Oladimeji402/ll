"use client";

import Panel, { PanelHeader } from "@/components/admin/ui/Panel";
import Button from "@/components/admin/ui/Button";
import Field from "@/components/admin/ui/form/Field";
import Input from "@/components/admin/ui/form/Input";
import Textarea from "@/components/admin/ui/form/Textarea";
import Skeleton from "@/components/admin/ui/Skeleton";
import { useSettingsSection } from "@/components/admin/settings/use-settings-section";

export default function SeoSettingsPage() {
  const { value, patch, save, saving, loading } = useSettingsSection("seo");

  if (loading || !value) return <Skeleton className="h-64 w-full" />;

  return (
    <Panel>
      <PanelHeader title="Search engine defaults" description="Used when a page doesn't set its own SEO fields." actions={<Button variant="primary" size="sm" loading={saving} onClick={save}>Save</Button>} />
      <div className="flex flex-col gap-4">
        <Field label="Default title" required>
          <Input value={value.defaultTitle} onChange={(e) => patch({ defaultTitle: e.target.value })} />
        </Field>
        <Field label="Default meta description" required>
          <Textarea rows={3} value={value.defaultDescription} onChange={(e) => patch({ defaultDescription: e.target.value })} />
        </Field>
      </div>
    </Panel>
  );
}
