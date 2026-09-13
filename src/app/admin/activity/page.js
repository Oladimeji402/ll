"use client";

import { useEffect, useState } from "react";
import { History } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Panel from "@/components/admin/ui/Panel";
import Select from "@/components/admin/ui/form/Select";
import Pagination from "@/components/admin/ui/Pagination";
import EmptyState from "@/components/admin/ui/EmptyState";
import { SkeletonRows } from "@/components/admin/ui/Skeleton";
import { avatarColor, initials } from "@/lib/admin/utils/avatar";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { formatDateTime } from "@/lib/admin/utils/format";
import { RESOURCE_TYPES } from "@/lib/admin/types/activity";
import { listActivity } from "@/lib/admin/services/activity-service";

export default function ActivityLogPage() {
  const mounted = useMounted();
  const [resourceType, setResourceType] = useState("all");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => setPage(1), [resourceType]);

  useEffect(() => {
    if (!mounted) return;
    setLoading(true);
    listActivity({ resourceType, page, pageSize: 15 }).then((res) => {
      setResult(res);
      setLoading(false);
    });
  }, [mounted, resourceType, page]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Activity Log"
        description="A record of changes made across the admin."
        actions={
          <Select value={resourceType} onChange={(e) => setResourceType(e.target.value)} className="w-40">
            <option value="all">All resources</option>
            {RESOURCE_TYPES.map((r) => (
              <option key={r} value={r} className="capitalize">{r}</option>
            ))}
          </Select>
        }
      />

      <Panel padded={false}>
        {!mounted || loading ? (
          <SkeletonRows rows={8} cols={3} />
        ) : result.items.length === 0 ? (
          <EmptyState icon={History} title="No activity yet" description="Actions taken across the admin will show up here." />
        ) : (
          <ul className="divide-y divide-[var(--admin-border)]">
            {result.items.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3 px-5 py-3.5 sm:px-6">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-medium text-white" style={{ backgroundColor: avatarColor(entry.actor.length) }}>
                  {initials(entry.actor)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[var(--admin-text)]">{entry.details}</p>
                  <p className="text-xs text-[var(--admin-text-muted)]">
                    {entry.actor} · {formatDateTime(entry.timestamp)} · <span className="capitalize">{entry.resourceType}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        {result && (
          <Pagination page={result.page} totalPages={result.totalPages} total={result.total} pageSize={result.pageSize} onPageChange={setPage} />
        )}
      </Panel>
    </div>
  );
}
