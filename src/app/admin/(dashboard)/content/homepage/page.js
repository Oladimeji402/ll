"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Panel, { PanelHeader } from "@/components/admin/ui/Panel";
import Button from "@/components/admin/ui/Button";
import Field from "@/components/admin/ui/form/Field";
import Input from "@/components/admin/ui/form/Input";
import Textarea from "@/components/admin/ui/form/Textarea";
import Switch from "@/components/admin/ui/form/Switch";
import Checkbox from "@/components/admin/ui/form/Checkbox";
import Skeleton from "@/components/admin/ui/Skeleton";
import { useToast } from "@/components/admin/ui/Toast";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { generateId } from "@/lib/admin/utils/id";
import { getHomepageContent, updateHomepageContent } from "@/lib/admin/services/content-service";
import { listCollections } from "@/lib/admin/services/collection-service";
import { listProducts } from "@/lib/admin/services/product-service";

export default function HomepageContentPage() {
  const mounted = useMounted();
  const toast = useToast();
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    getHomepageContent().then((c) => {
      setContent(c);
      setLoading(false);
    });
    listCollections().then(setCollections);
    listProducts({ pageSize: 1000 }).then((res) => setProducts(res.items));
  }, [mounted]);

  function update(patch) {
    setContent((c) => ({ ...c, ...patch }));
  }

  function updateHero(patch) {
    setContent((c) => ({ ...c, hero: { ...c.hero, ...patch } }));
  }

  function toggleFeatured(field, id) {
    setContent((c) => {
      const current = c[field];
      const next = current.includes(id) ? current.filter((v) => v !== id) : [...current, id];
      return { ...c, [field]: next };
    });
  }

  function updateSection(id, patch) {
    setContent((c) => ({
      ...c,
      editorialSections: c.editorialSections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }

  function addSection() {
    setContent((c) => ({
      ...c,
      editorialSections: [...c.editorialSections, { id: generateId("section"), heading: "", body: "" }],
    }));
  }

  function removeSection(id) {
    setContent((c) => ({ ...c, editorialSections: c.editorialSections.filter((s) => s.id !== id) }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateHomepageContent(content);
      toast({ title: "Homepage updated", description: "Changes are live on the storefront." });
    } finally {
      setSaving(false);
    }
  }

  if (!mounted || loading || !content) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-16">
      <PageHeader
        title="Homepage"
        description="Controls the storefront's homepage — this feeds the live site."
        actions={<Button variant="primary" size="sm" loading={saving} onClick={handleSave}>Save changes</Button>}
      />

      <Panel>
        <PanelHeader title="Hero section" />
        <div className="flex flex-col gap-4">
          <Field label="Heading">
            <Input value={content.hero.heading} onChange={(e) => updateHero({ heading: e.target.value })} />
          </Field>
          <Field label="Description">
            <Textarea rows={3} value={content.hero.description} onChange={(e) => updateHero({ description: e.target.value })} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="CTA label">
              <Input value={content.hero.ctaLabel} onChange={(e) => updateHero({ ctaLabel: e.target.value })} />
            </Field>
            <Field label="CTA link">
              <Input value={content.hero.ctaHref} onChange={(e) => updateHero({ ctaHref: e.target.value })} />
            </Field>
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Announcement bar" />
        <div className="flex flex-col gap-4">
          <Switch
            label="Show announcement bar"
            checked={content.announcementBar.enabled}
            onChange={(v) => update({ announcementBar: { ...content.announcementBar, enabled: v } })}
          />
          <Field label="Message">
            <Input
              value={content.announcementBar.text}
              onChange={(e) => update({ announcementBar: { ...content.announcementBar, text: e.target.value } })}
            />
          </Field>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Panel>
          <PanelHeader title="Featured collections" />
          <div className="flex flex-col gap-2">
            {collections.map((c) => (
              <Checkbox
                key={c.id}
                label={c.title}
                checked={content.featuredCollectionIds.includes(c.id)}
                onChange={() => toggleFeatured("featuredCollectionIds", c.id)}
              />
            ))}
          </div>
        </Panel>
        <Panel>
          <PanelHeader title="Featured products" />
          <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
            {products.slice(0, 24).map((p) => (
              <Checkbox
                key={p.id}
                label={p.title}
                checked={content.featuredProductIds.includes(p.id)}
                onChange={() => toggleFeatured("featuredProductIds", p.id)}
              />
            ))}
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHeader
          title="Editorial sections"
          actions={
            <Button size="sm" variant="secondary" onClick={addSection}>
              <Plus className="h-3.5 w-3.5" /> Add section
            </Button>
          }
        />
        <div className="flex flex-col gap-4">
          {content.editorialSections.map((section) => (
            <div key={section.id} className="flex flex-col gap-3 border border-[var(--admin-border)] p-4">
              <div className="flex items-center justify-between gap-3">
                <Input
                  value={section.heading}
                  onChange={(e) => updateSection(section.id, { heading: e.target.value })}
                  placeholder="Section heading"
                  className="max-w-xs"
                />
                <button type="button" onClick={() => removeSection(section.id)} aria-label="Remove section" className="text-[var(--admin-text-muted)] hover:text-[var(--admin-danger)]">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <Textarea rows={3} value={section.body} onChange={(e) => updateSection(section.id, { body: e.target.value })} placeholder="Section copy" />
            </div>
          ))}
          {content.editorialSections.length === 0 && <p className="text-sm text-[var(--admin-text-muted)]">No editorial sections yet.</p>}
        </div>
      </Panel>
    </div>
  );
}
