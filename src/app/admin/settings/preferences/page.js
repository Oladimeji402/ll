"use client";

import Panel, { PanelHeader } from "@/components/admin/ui/Panel";
import Button from "@/components/admin/ui/Button";
import Field from "@/components/admin/ui/form/Field";
import Select from "@/components/admin/ui/form/Select";
import Skeleton from "@/components/admin/ui/Skeleton";
import { useSettingsSection } from "@/components/admin/settings/use-settings-section";

export default function PreferencesSettingsPage() {
  const { value, patch, save, saving, loading } = useSettingsSection("preferences");

  if (loading || !value) return <Skeleton className="h-64 w-full" />;

  return (
    <Panel>
      <PanelHeader title="Admin preferences" description="Personal display preferences for this admin account." actions={<Button variant="primary" size="sm" loading={saving} onClick={save}>Save</Button>} />
      <div className="flex flex-col gap-4">
        <Field label="Date format">
          <Select value={value.dateFormat} onChange={(e) => patch({ dateFormat: e.target.value })}>
            <option value="MMM D, YYYY">Sep 13, 2026</option>
            <option value="DD/MM/YYYY">13/09/2026</option>
            <option value="MM/DD/YYYY">09/13/2026</option>
          </Select>
        </Field>
        <Field label="Timezone">
          <Select value={value.timezone} onChange={(e) => patch({ timezone: e.target.value })}>
            <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
            <option value="America/New_York">America/New York (EST)</option>
          </Select>
        </Field>
        <Field label="Week starts on">
          <Select value={value.weekStartsOn} onChange={(e) => patch({ weekStartsOn: e.target.value })}>
            <option value="Monday">Monday</option>
            <option value="Sunday">Sunday</option>
          </Select>
        </Field>
      </div>
    </Panel>
  );
}
