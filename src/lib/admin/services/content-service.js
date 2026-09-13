import { useHomepageStore } from "../store/homepage-store";
import { useNavigationStore } from "../store/navigation-store";
import { useBannersStore } from "../store/banners-store";
import { useMediaStore } from "../store/media-store";
import { generateId } from "../utils/id";
import { simulateLatency } from "../utils/async";
import { sortBy } from "../utils/list-query";
import { logActivity } from "./activity-service";

// ---- Homepage ---------------------------------------------------------
export async function getHomepageContent() {
  await simulateLatency(250);
  return useHomepageStore.getState().value;
}

export async function updateHomepageContent(patch) {
  await simulateLatency(450);
  useHomepageStore.getState()._patch(patch);
  logActivity({ action: "updated homepage content", resourceType: "content", resourceId: "homepage", resourceLabel: "Homepage" });
  return useHomepageStore.getState().value;
}

// ---- Navigation ---------------------------------------------------------
export async function listNavItems() {
  await simulateLatency(200);
  return sortBy(useNavigationStore.getState().items, { field: "order", direction: "asc" });
}

export async function createNavItem(input) {
  await simulateLatency(350);
  const order = useNavigationStore.getState().items.length;
  const item = { id: generateId("nav"), ...input, order, children: [] };
  useNavigationStore.getState()._upsert(item);
  logActivity({ action: "added navigation item", resourceType: "content", resourceId: item.id, resourceLabel: item.label });
  return item;
}

export async function updateNavItem(id, patch) {
  await simulateLatency(300);
  const existing = useNavigationStore.getState().items.find((n) => n.id === id);
  if (!existing) throw new Error("Navigation item not found");
  const updated = { ...existing, ...patch };
  useNavigationStore.getState()._upsert(updated);
  return updated;
}

export async function reorderNavItems(orderedIds) {
  await simulateLatency(300);
  const items = orderedIds.map((id, order) => {
    const existing = useNavigationStore.getState().items.find((n) => n.id === id);
    return { ...existing, order };
  });
  useNavigationStore.getState()._setAll(items);
  logActivity({ action: "reordered navigation", resourceType: "content", resourceId: "navigation", resourceLabel: "Navigation" });
  return items;
}

export async function deleteNavItem(id) {
  await simulateLatency(300);
  useNavigationStore.getState()._remove(id);
}

// ---- Banners ---------------------------------------------------------
export async function listBanners() {
  await simulateLatency(250);
  return sortBy(useBannersStore.getState().items, { field: "startDate", direction: "desc" });
}

export async function getBanner(id) {
  await simulateLatency(200);
  return useBannersStore.getState().items.find((b) => b.id === id) ?? null;
}

export async function createBanner(input) {
  await simulateLatency(450);
  const banner = { id: generateId("banner"), ...input };
  useBannersStore.getState()._upsert(banner);
  logActivity({ action: "created banner", resourceType: "content", resourceId: banner.id, resourceLabel: banner.heading });
  return banner;
}

export async function updateBanner(id, patch) {
  await simulateLatency(400);
  const existing = useBannersStore.getState().items.find((b) => b.id === id);
  if (!existing) throw new Error("Banner not found");
  const updated = { ...existing, ...patch };
  useBannersStore.getState()._upsert(updated);
  logActivity({ action: "updated banner", resourceType: "content", resourceId: id, resourceLabel: updated.heading });
  return updated;
}

export async function deleteBanner(id) {
  await simulateLatency(300);
  const banner = useBannersStore.getState().items.find((b) => b.id === id);
  useBannersStore.getState()._remove(id);
  if (banner) {
    logActivity({ action: "deleted banner", resourceType: "content", resourceId: id, resourceLabel: banner.heading });
  }
}

// ---- Media library ---------------------------------------------------------
export async function listMedia({ search = "" } = {}) {
  await simulateLatency(300);
  const all = useMediaStore.getState().items;
  const term = search.trim().toLowerCase();
  const filtered = term ? all.filter((m) => m.name.toLowerCase().includes(term)) : all;
  return sortBy(filtered, { field: "uploadedAt", direction: "desc" });
}

export async function uploadMedia(file) {
  await simulateLatency(600);
  const asset = {
    id: generateId("media"),
    name: file.name,
    tone: Math.floor(Math.random() * 5),
    size: Math.round(file.size / 1024) || 240,
    uploadedAt: new Date().toISOString(),
    usedIn: [],
  };
  useMediaStore.getState()._upsert(asset);
  logActivity({ action: "uploaded media", resourceType: "content", resourceId: asset.id, resourceLabel: asset.name });
  return asset;
}

export async function deleteMedia(id) {
  await simulateLatency(300);
  const asset = useMediaStore.getState().items.find((m) => m.id === id);
  useMediaStore.getState()._remove(id);
  if (asset) {
    logActivity({ action: "deleted media", resourceType: "content", resourceId: id, resourceLabel: asset.name });
  }
}
