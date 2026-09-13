"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Layers, Plus, Eye, EyeOff } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Panel from "@/components/admin/ui/Panel";
import Button from "@/components/admin/ui/Button";
import EmptyState from "@/components/admin/ui/EmptyState";
import Modal from "@/components/admin/ui/Modal";
import Field from "@/components/admin/ui/form/Field";
import Input from "@/components/admin/ui/form/Input";
import Textarea from "@/components/admin/ui/form/Textarea";
import { SkeletonCards } from "@/components/admin/ui/Skeleton";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { slugify } from "@/lib/utils";
import { useToast } from "@/components/admin/ui/Toast";
import { listCollections, createCollection } from "@/lib/admin/services/collection-service";

export default function CollectionsPage() {
  const mounted = useMounted();
  const router = useRouter();
  const toast = useToast();

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("new") === "1") setModalOpen(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setLoading(true);
    listCollections().then((items) => {
      setCollections(items);
      setLoading(false);
    });
  }, [mounted, refreshKey]);

  async function handleCreate() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const collection = await createCollection({
        title: form.title,
        slug: slugify(form.title),
        description: form.description,
        tone: collections.length % 5,
        status: "visible",
        seoTitle: "",
        seoDescription: "",
      });
      toast({ title: "Collection created", description: collection.title });
      setModalOpen(false);
      setForm({ title: "", description: "" });
      router.replace("/admin/collections");
      setRefreshKey((k) => k + 1);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Collections"
        description="Group products into curated storefront collections."
        actions={
          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> New collection
          </Button>
        }
      />

      {!mounted || loading ? (
        <SkeletonCards count={8} />
      ) : collections.length === 0 ? (
        <Panel>
          <EmptyState
            icon={Layers}
            title="No collections yet"
            description="Group your products into collections like New Arrivals or Best Sellers."
            action={
              <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4" /> New collection
              </Button>
            }
          />
        </Panel>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {collections.map((collection) => (
            <Link key={collection.id} href={`/admin/collections/${collection.id}`} className="group block border border-[var(--admin-border)] bg-[var(--admin-surface)]">
              <div className="aspect-[4/3] overflow-hidden">
                <PlaceholderImage tone={collection.tone} alt={collection.title} zoomOnHover className="transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <p className="min-w-0 flex-1 truncate font-medium text-[var(--admin-text)]">{collection.title}</p>
                  {collection.status === "visible" ? (
                    <Eye className="h-3.5 w-3.5 shrink-0 text-[var(--admin-success)]" aria-label="Visible" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5 shrink-0 text-[var(--admin-text-muted)]" aria-label="Hidden" />
                  )}
                </div>
                <p className="mt-1 text-xs text-[var(--admin-text-muted)]">{collection.productIds.length} products</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          router.replace("/admin/collections");
        }}
        title="New collection"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={saving} onClick={handleCreate}>Create collection</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Title" required>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Holiday Edit" />
          </Field>
          <Field label="Description">
            <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
