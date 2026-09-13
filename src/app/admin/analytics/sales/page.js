"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Panel, { PanelHeader } from "@/components/admin/ui/Panel";
import StatCard from "@/components/admin/ui/StatCard";
import DateRangePicker from "@/components/admin/ui/DateRangePicker";
import LineChart from "@/components/admin/ui/charts/LineChart";
import { SkeletonCards } from "@/components/admin/ui/Skeleton";
import AnalyticsNav from "@/components/admin/analytics/AnalyticsNav";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { formatCurrency } from "@/lib/admin/utils/format";
import { getDashboardMetrics, getSalesSeries } from "@/lib/admin/services/analytics-service";

const METRICS = [
  { key: "revenue", label: "Revenue" },
  { key: "orders", label: "Orders" },
];

export default function SalesAnalyticsPage() {
  const mounted = useMounted();
  const [rangeKey, setRangeKey] = useState("last30");
  const [custom, setCustom] = useState(null);
  const [metric, setMetric] = useState("revenue");
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [series, setSeries] = useState([]);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([getDashboardMetrics(rangeKey, custom), getSalesSeries(rangeKey, custom, metric)]).then(([m, s]) => {
      if (cancelled) return;
      setMetrics(m);
      setSeries(s);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [mounted, rangeKey, custom, metric]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Analytics" description="Performance across your store." />
      <AnalyticsNav />

      <div className="flex justify-end">
        <DateRangePicker value={rangeKey} custom={custom} onChange={(key, c) => { setRangeKey(key); setCustom(key === "custom" ? c : null); }} />
      </div>

      {!mounted || loading || !metrics ? (
        <SkeletonCards count={3} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Revenue" value={formatCurrency(metrics.revenue.value)} change={metrics.revenue.change} />
            <StatCard label="Orders" value={metrics.orders.value} change={metrics.orders.change} />
            <StatCard label="Avg. Order Value" value={formatCurrency(metrics.aov.value)} change={metrics.aov.change} />
          </div>

          <Panel>
            <PanelHeader
              title="Sales Overview"
              description="Compared to the previous period"
              actions={
                <div className="flex border border-[var(--admin-border)]">
                  {METRICS.map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setMetric(m.key)}
                      className={`px-3 py-1.5 text-xs font-medium ${metric === m.key ? "bg-[var(--color-primary)] text-white" : "text-[var(--admin-text-muted)]"}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              }
            />
            <LineChart data={series} formatValue={metric === "revenue" ? formatCurrency : (v) => v} />
          </Panel>
        </>
      )}
    </div>
  );
}
