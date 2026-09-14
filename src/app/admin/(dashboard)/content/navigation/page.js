"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, Menu } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Panel, { PanelHeader } from "@/components/admin/ui/Panel";
import Button from "@/components/admin/ui/Button";
import Input from "@/components/admin/ui/form/Input";
import Skeleton from "@/components/admin/ui/Skeleton";
import EmptyState from "@/components/admin/ui/EmptyState";
import { useToast } from "@/components/admin/ui/Toast";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { listNavItems, createNavItem, updateNavItem, deleteNavItem, reorderNavItems } from "@/lib/admin/services/content-service";

export default function NavigationContentPage() {
  const mounted = useMounted();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mounted) return;
    listNavItems().then((res) => {
      setItems(res);
      setLoading(false);
    });
  }, [mounted]);

  function updateLocal(id, patch) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  async function handleBlurSave(item) {
    await updateNavItem(item.id, { label: item.label, href: item.href });
  }

  async function handleAdd() {
    const item = await createNavItem({ label: "New Link", href: "/" });
    setItems((prev) => [...prev, item]);
  }

  async function handleRemove(id) {
    await deleteNavItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function move(index, direction) {
    const next = [...items];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    await reorderNavItems(next.map((i) => i.id));
  }

  async function handleSaveAll() {
    toast({ title: "Navigation saved" });
  }

  if (!mounted || loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Navigation"
        description="Controls the storefront's primary menu."
        actions={
          <>
            <Button size="sm" variant="secondary" onClick={handleAdd}>
              <Plus className="h-3.5 w-3.5" /> Add link
            </Button>
            <Button size="sm" variant="primary" onClick={handleSaveAll}>Save changes</Button>
          </>
        }
      />

      <Panel padded={false}>
        <PanelHeader title="Menu items" className="px-5 pt-5 sm:px-6" />
        {items.length === 0 ? (
          <EmptyState icon={Menu} title="No navigation links" description="Add your first menu item." />
        ) : (
          <ul className="divide-y divide-[var(--admin-border)]">
            {items.map((item, index) => (
              <li key={item.id} className="flex flex-wrap items-center gap-3 px-5 py-3 sm:px-6">
                <div className="flex flex-col gap-1">
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up" className="text-[var(--admin-text-muted)] disabled:opacity-30">
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label="Move down" className="text-[var(--admin-text-muted)] disabled:opacity-30">
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                <Input
                  value={item.label}
                  onChange={(e) => updateLocal(item.id, { label: e.target.value })}
                  onBlur={() => handleBlurSave(item)}
                  className="max-w-[160px]"
                />
                <Input
                  value={item.href}
                  onChange={(e) => updateLocal(item.id, { href: e.target.value })}
                  onBlur={() => handleBlurSave(item)}
                  className="max-w-[200px] flex-1"
                />
                <button type="button" onClick={() => handleRemove(item.id)} aria-label={`Remove ${item.label}`} className="ml-auto text-[var(--admin-text-muted)] hover:text-[var(--admin-danger)]">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
