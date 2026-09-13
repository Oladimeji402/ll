"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/admin/ui/Toast";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { getSettings, updateSettingsSection } from "@/lib/admin/services/settings-service";

export function useSettingsSection(section) {
  const mounted = useMounted();
  const toast = useToast();
  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    getSettings().then((all) => {
      setValue(all[section]);
      setLoading(false);
    });
  }, [mounted, section]);

  function patch(next) {
    setValue((v) => ({ ...v, ...next }));
  }

  async function save() {
    setSaving(true);
    try {
      await updateSettingsSection(section, value);
      toast({ title: "Settings saved" });
    } finally {
      setSaving(false);
    }
  }

  return { value, patch, save, saving, loading: !mounted || loading };
}
