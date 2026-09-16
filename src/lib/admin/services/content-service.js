import { createClient } from "@/lib/supabase/client";
import { generateId } from "../utils/id";
import { sortBy } from "../utils/list-query";
import { logActivity } from "./activity-service";

// ---- Homepage ---------------------------------------------------------
// Same store_settings singleton-blob table as shipping/settings.

export async function getHomepageContent() {
  const supabase = createClient();
  const { data, error } = await supabase.from("store_settings").select("value").eq("key", "homepage").maybeSingle();
  if (error) throw error;
  return data?.value ?? {};
}

export async function updateHomepageContent(patch) {
  const supabase = createClient();
  const current = await getHomepageContent();
  const next = { ...current, ...patch };
  const { error } = await supabase
    .from("store_settings")
    .upsert({ key: "homepage", value: next, updated_at: new Date().toISOString() });
  if (error) throw error;
  logActivity({ action: "updated homepage content", resourceType: "content", resourceId: "homepage", resourceLabel: "Homepage" });
  return next;
}

// ---- Navigation ---------------------------------------------------------

function mapNavRow(row) {
  return { id: row.id, label: row.label, href: row.href, order: row.position, children: [] };
}

export async function listNavItems() {
  const supabase = createClient();
  const { data, error } = await supabase.from("navigation_items").select("*");
  if (error) throw error;
  return sortBy(data.map(mapNavRow), { field: "order", direction: "asc" });
}

export async function createNavItem(input) {
  const supabase = createClient();
  const { count } = await supabase.from("navigation_items").select("id", { count: "exact", head: true });
  const { data, error } = await supabase
    .from("navigation_items")
    .insert({ label: input.label, href: input.href, position: count ?? 0 })
    .select()
    .single();
  if (error) throw error;
  const item = mapNavRow(data);
  logActivity({ action: "added navigation item", resourceType: "content", resourceId: item.id, resourceLabel: item.label });
  return item;
}

export async function updateNavItem(id, patch) {
  const supabase = createClient();
  const row = {};
  if (patch.label !== undefined) row.label = patch.label;
  if (patch.href !== undefined) row.href = patch.href;
  const { data, error } = await supabase.from("navigation_items").update(row).eq("id", id).select().single();
  if (error) throw error;
  return mapNavRow(data);
}

export async function reorderNavItems(orderedIds) {
  const supabase = createClient();
  await Promise.all(
    orderedIds.map((id, order) => supabase.from("navigation_items").update({ position: order }).eq("id", id)),
  );
  logActivity({ action: "reordered navigation", resourceType: "content", resourceId: "navigation", resourceLabel: "Navigation" });
  return listNavItems();
}

export async function deleteNavItem(id) {
  const supabase = createClient();
  const { error } = await supabase.from("navigation_items").delete().eq("id", id);
  if (error) throw error;
}

// ---- Banners ---------------------------------------------------------

function mapBannerRow(row) {
  return {
    id: row.id,
    heading: row.heading,
    subheading: row.subheading,
    ctaLabel: row.cta_label,
    ctaHref: row.cta_href,
    tone: row.tone,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
  };
}

function toBannerRow(input) {
  const row = {};
  if (input.heading !== undefined) row.heading = input.heading;
  if (input.subheading !== undefined) row.subheading = input.subheading;
  if (input.ctaLabel !== undefined) row.cta_label = input.ctaLabel;
  if (input.ctaHref !== undefined) row.cta_href = input.ctaHref;
  if (input.tone !== undefined) row.tone = input.tone;
  if (input.startDate !== undefined) row.start_date = input.startDate;
  if (input.endDate !== undefined) row.end_date = input.endDate;
  if (input.status !== undefined) row.status = input.status;
  return row;
}

export async function listBanners() {
  const supabase = createClient();
  const { data, error } = await supabase.from("banners").select("*");
  if (error) throw error;
  return sortBy(data.map(mapBannerRow), { field: "startDate", direction: "desc" });
}

export async function getBanner(id) {
  const supabase = createClient();
  const { data, error } = await supabase.from("banners").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapBannerRow(data) : null;
}

export async function createBanner(input) {
  const supabase = createClient();
  const { data, error } = await supabase.from("banners").insert(toBannerRow(input)).select().single();
  if (error) throw error;
  const banner = mapBannerRow(data);
  logActivity({ action: "created banner", resourceType: "content", resourceId: banner.id, resourceLabel: banner.heading });
  return banner;
}

export async function updateBanner(id, patch) {
  const supabase = createClient();
  const { data, error } = await supabase.from("banners").update(toBannerRow(patch)).eq("id", id).select().single();
  if (error) throw error;
  const updated = mapBannerRow(data);
  logActivity({ action: "updated banner", resourceType: "content", resourceId: id, resourceLabel: updated.heading });
  return updated;
}

export async function deleteBanner(id) {
  const supabase = createClient();
  const banner = await getBanner(id);
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) throw error;
  if (banner) {
    logActivity({ action: "deleted banner", resourceType: "content", resourceId: id, resourceLabel: banner.heading });
  }
}

// ---- Media library ---------------------------------------------------------

function mapMediaRow(row) {
  return {
    id: row.id,
    name: row.name,
    tone: row.tone,
    size: row.size_kb,
    uploadedAt: row.uploaded_at,
    usedIn: [],
    url: row.url,
  };
}

const MEDIA_BUCKET = "media";

export async function listMedia({ search = "" } = {}) {
  const supabase = createClient();
  const { data, error } = await supabase.from("media").select("*");
  if (error) throw error;
  const term = search.trim().toLowerCase();
  const filtered = term ? data.filter((m) => m.name.toLowerCase().includes(term)) : data;
  return sortBy(filtered.map(mapMediaRow), { field: "uploadedAt", direction: "desc" });
}

export async function uploadMedia(file) {
  const supabase = createClient();
  const path = `${generateId("media")}-${file.name}`;

  const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file);
  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

  const { data, error } = await supabase
    .from("media")
    .insert({
      name: file.name,
      storage_path: path,
      url: publicUrl,
      size_kb: Math.round(file.size / 1024) || 1,
      tone: Math.floor(Math.random() * 5),
    })
    .select()
    .single();
  if (error) throw error;

  const asset = mapMediaRow(data);
  logActivity({ action: "uploaded media", resourceType: "content", resourceId: asset.id, resourceLabel: asset.name });
  return asset;
}

export async function deleteMedia(id) {
  const supabase = createClient();
  const { data: existing } = await supabase.from("media").select("name, storage_path").eq("id", id).maybeSingle();
  const { error } = await supabase.from("media").delete().eq("id", id);
  if (error) throw error;
  if (existing) {
    await supabase.storage.from(MEDIA_BUCKET).remove([existing.storage_path]);
    logActivity({ action: "deleted media", resourceType: "content", resourceId: id, resourceLabel: existing.name });
  }
}
