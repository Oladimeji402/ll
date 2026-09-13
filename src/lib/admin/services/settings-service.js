import { useSettingsStore } from "../store/settings-store";
import { simulateLatency } from "../utils/async";
import { logActivity } from "./activity-service";

export async function getSettings() {
  await simulateLatency(250);
  return useSettingsStore.getState().value;
}

export async function updateSettingsSection(section, patch) {
  await simulateLatency(400);
  const current = useSettingsStore.getState().value;
  useSettingsStore.getState()._patch({ [section]: { ...current[section], ...patch } });
  logActivity({
    action: "updated settings",
    resourceType: "settings",
    resourceId: section,
    resourceLabel: section,
    details: `Updated ${section} settings`,
  });
  return useSettingsStore.getState().value;
}
