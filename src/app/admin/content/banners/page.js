"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, Plus, Pencil, Trash2 } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Panel from "@/components/admin/ui/Panel";
import Button from "@/components/admin/ui/Button";
import { StatusBadge } from "@/components/admin/ui/Badge";
import Modal from "@/components/admin/ui/Modal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import Field from "@/components/admin/ui/form/Field";
import Input from "@/components/admin/ui/form/Input";
import Textarea from "@/components/admin/ui/form/Textarea";
import EmptyState from "@/components/admin/ui/EmptyState";
import { SkeletonCards } from "@/components/admin/ui/Skeleton";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { useToast } from "@/components/admin/ui/Toast";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { formatDate } from "@/lib/admin/utils/format";
import { listBanners, createBanner, updateBanner, deleteBanner } from "@/lib/admin/services/content-service";

const EMPTY_FORM = { heading: "", subheading: "", ctaLabel: "Shop Now", ctaHref: "/", tone: 0, startDate: "", endDate: "", status: "draft" };

export default function BannersContentPage() {
  const mounted = useMounted();
  const toast = useToast();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function refresh() {
    setBanners(await listBanners());
    setLoading(false);
  }

  useEffect(() => {
    if (!mounted) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(banner) {
    setEditing(banner);
    setForm(banner);
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        await updateBanner(editing.id, form);
        toast({ title: "Banner updated" });
      } else {
        await createBanner(form);
        toast({ title: "Banner created" });
      }
      setModalOpen(false);
      refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    await deleteBanner(deleteTarget.id);
    toast({ title: "Banner deleted", variant: "info" });
    setDeleteTarget(null);
    refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Banners"
        description="Promotional banners shown across the storefront."
        actions={
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> New banner
          </Button>
        }
      />

      {!mounted || loading ? (
        <SkeletonCards count={4} />
      ) : banners.length === 0 ? (
        <Panel>
          <EmptyState icon={ImageIcon} title="No banners yet" description="Create a banner to promote a sale or collection." action={<Button variant="primary" size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> New banner</Button>} />
        </Panel>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {banners.map((banner) => (
            <Panel key={banner.id} padded={false}>
              <div className="aspect-[3/1] overflow-hidden">
                <PlaceholderImage tone={banner.tone} alt={banner.heading} />
              </div>
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-[var(--admin-text)]">{banner.heading}</p>
                  <p className="mt-0.5 text-xs text-[var(--admin-text-muted)]">
                    {formatDate(banner.startDate)} – {banner.endDate ? formatDate(banner.endDate) : "No end"}
                  </p>
                  <StatusBadge status={banner.status} className="mt-2" />
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => openEdit(banner)} aria-label="Edit banner" className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(banner)} aria-label="Delete banner" className="text-[var(--admin-text-muted)] hover:text-[var(--admin-danger)]">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit banner" : "New banner"}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>Save banner</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Heading" required>
            <Input value={form.heading} onChange={(e) => setForm((f) => ({ ...f, heading: e.target.value }))} />
          </Field>
          <Field label="Subheading">
            <Textarea rows={2} value={form.subheading} onChange={(e) => setForm((f) => ({ ...f, subheading: e.target.value }))} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="CTA label">
              <Input value={form.ctaLabel} onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))} />
            </Field>
            <Field label="CTA link">
              <Input value={form.ctaHref} onChange={(e) => setForm((f) => ({ ...f, ctaHref: e.target.value }))} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start date" required>
              <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
            </Field>
            <Field label="End date">
              <Input type="date" value={form.endDate ?? ""} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
            </Field>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete banner?"
        description={`"${deleteTarget?.heading}" will be permanently removed.`}
        confirmLabel="Delete banner"
      />
    </div>
  );
}
