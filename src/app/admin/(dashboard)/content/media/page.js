"use client";

import { useEffect, useState } from "react";
import { Grid2x2, List, Trash2, Images } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Panel from "@/components/admin/ui/Panel";
import SearchInput from "@/components/admin/ui/SearchInput";
import FileDrop from "@/components/admin/ui/FileDrop";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import EmptyState from "@/components/admin/ui/EmptyState";
import { SkeletonCards } from "@/components/admin/ui/Skeleton";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/admin/ui/Toast";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { formatDate } from "@/lib/admin/utils/format";
import { listMedia, uploadMedia, deleteMedia } from "@/lib/admin/services/content-service";

export default function MediaLibraryPage() {
  const mounted = useMounted();
  const toast = useToast();
  const [media, setMedia] = useState([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function refresh() {
    setMedia(await listMedia({ search }));
    setLoading(false);
  }

  useEffect(() => {
    if (!mounted) return;
    setLoading(true);
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, search]);

  async function handleUpload(files) {
    for (const file of files) {
      await uploadMedia(file);
    }
    toast({ title: `${files.length} file(s) uploaded` });
    refresh();
  }

  async function handleDelete() {
    await deleteMedia(deleteTarget.id);
    toast({ title: "File deleted", variant: "info" });
    setDeleteTarget(null);
    refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Media Library" description="Images available across products, banners, and pages." />

      <Panel>
        <FileDrop onFiles={handleUpload} />
      </Panel>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search media" className="max-w-xs" />
        <div className="flex border border-[var(--admin-border)]">
          <button type="button" onClick={() => setView("grid")} aria-label="Grid view" className={cn("flex h-9 w-9 items-center justify-center", view === "grid" ? "bg-[var(--admin-surface-alt)]" : "text-[var(--admin-text-muted)]")}>
            <Grid2x2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setView("list")} aria-label="List view" className={cn("flex h-9 w-9 items-center justify-center", view === "list" ? "bg-[var(--admin-surface-alt)]" : "text-[var(--admin-text-muted)]")}>
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!mounted || loading ? (
        <SkeletonCards count={8} />
      ) : media.length === 0 ? (
        <Panel>
          <EmptyState icon={Images} title="No media yet" description="Upload images to use across your storefront." />
        </Panel>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {media.map((asset) => (
            <div key={asset.id} className="group relative border border-[var(--admin-border)] bg-[var(--admin-surface)]">
              <div className="aspect-square overflow-hidden">
                <PlaceholderImage tone={asset.tone} alt={asset.name} />
              </div>
              <p className="truncate px-2 py-1.5 text-[11px] text-[var(--admin-text-muted)]">{asset.name}</p>
              <button
                type="button"
                onClick={() => setDeleteTarget(asset)}
                aria-label={`Delete ${asset.name}`}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <Panel padded={false}>
          <ul className="divide-y divide-[var(--admin-border)]">
            {media.map((asset) => (
              <li key={asset.id} className="flex items-center gap-3 px-4 py-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden">
                  <PlaceholderImage tone={asset.tone} alt={asset.name} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[var(--admin-text)]">{asset.name}</p>
                  <p className="text-xs text-[var(--admin-text-muted)]">{asset.size} KB · {formatDate(asset.uploadedAt)}</p>
                </div>
                <button type="button" onClick={() => setDeleteTarget(asset)} aria-label={`Delete ${asset.name}`} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-danger)]">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete file?"
        description={`"${deleteTarget?.name}" will be permanently removed.`}
        confirmLabel="Delete file"
      />
    </div>
  );
}
