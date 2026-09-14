"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Panel, { PanelHeader } from "@/components/admin/ui/Panel";
import DateRangePicker from "@/components/admin/ui/DateRangePicker";
import SplitBar from "@/components/admin/ui/charts/SplitBar";
import DataTable from "@/components/admin/ui/DataTable";
import EmptyState from "@/components/admin/ui/EmptyState";
import AnalyticsNav from "@/components/admin/analytics/AnalyticsNav";
import { avatarColor, initials } from "@/lib/admin/utils/avatar";
import { Users } from "lucide-react";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { formatCurrency } from "@/lib/admin/utils/format";
import { getCustomerAnalytics } from "@/lib/admin/services/analytics-service";
import { listCustomers } from "@/lib/admin/services/customer-service";

export default function CustomersAnalyticsPage() {
  const mounted = useMounted();
  const [rangeKey, setRangeKey] = useState("last30");
  const [custom, setCustom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [topCustomers, setTopCustomers] = useState([]);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getCustomerAnalytics(rangeKey, custom),
      listCustomers({ sort: { field: "totalSpent", direction: "desc" }, pageSize: 8 }),
    ]).then(([a, c]) => {
      if (cancelled) return;
      setAnalytics(a);
      setTopCustomers(c.items);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [mounted, rangeKey, custom]);

  const columns = [
    {
      key: "name",
      header: "Customer",
      render: (c) => (
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white" style={{ backgroundColor: avatarColor(c.tone) }}>
            {initials(c.name)}
          </span>
          <span className="truncate text-[var(--admin-text)]">{c.name}</span>
        </div>
      ),
    },
    { key: "ordersCount", header: "Orders" },
    { key: "totalSpent", header: "Total spent", render: (c) => formatCurrency(c.totalSpent) },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Analytics" description="Performance across your store." />
      <AnalyticsNav />

      <div className="flex justify-end">
        <DateRangePicker value={rangeKey} custom={custom} onChange={(key, c) => { setRangeKey(key); setCustom(key === "custom" ? c : null); }} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel>
          <PanelHeader title="New vs Returning" />
          {!mounted || loading || !analytics ? (
            <p className="text-sm text-[var(--admin-text-muted)]">Loading…</p>
          ) : (
            <>
              <SplitBar
                segments={[
                  { label: "New", value: analytics.newCount, color: "var(--color-primary)" },
                  { label: "Returning", value: analytics.returningCount, color: "var(--admin-info)" },
                ]}
              />
              <div className="mt-5 border-t border-[var(--admin-border)] pt-4">
                <p className="text-xs text-[var(--admin-text-muted)]">Repeat purchase rate</p>
                <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--admin-text)]">{analytics.repeatPurchaseRate.toFixed(1)}%</p>
              </div>
            </>
          )}
        </Panel>

        <Panel padded={false} className="lg:col-span-2">
          <PanelHeader title="Top Customers" className="px-5 pt-5 sm:px-6" />
          <DataTable
            columns={columns}
            rows={topCustomers}
            loading={!mounted || loading}
            empty={<EmptyState icon={Users} title="No customers yet" />}
          />
        </Panel>
      </div>
    </div>
  );
}
