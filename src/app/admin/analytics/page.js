"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Panel, { PanelHeader } from "@/components/admin/ui/Panel";
import StatCard from "@/components/admin/ui/StatCard";
import DateRangePicker from "@/components/admin/ui/DateRangePicker";
import LineChart from "@/components/admin/ui/charts/LineChart";
import BarList from "@/components/admin/ui/charts/BarList";
import SplitBar from "@/components/admin/ui/charts/SplitBar";
import { SkeletonCards } from "@/components/admin/ui/Skeleton";
import AnalyticsNav from "@/components/admin/analytics/AnalyticsNav";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { formatCurrency } from "@/lib/admin/utils/format";
import {
  getDashboardMetrics,
  getSalesSeries,
  getTopProducts,
  getTopCollections,
  getCustomerAnalytics,
} from "@/lib/admin/services/analytics-service";

export default function AnalyticsOverviewPage() {
  const mounted = useMounted();
  const [rangeKey, setRangeKey] = useState("last30");
  const [custom, setCustom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getDashboardMetrics(rangeKey, custom),
      getSalesSeries(rangeKey, custom, "revenue"),
      getTopProducts(rangeKey, custom, 5),
      getTopCollections(rangeKey, custom, 5),
      getCustomerAnalytics(rangeKey, custom),
    ]).then(([metrics, series, topProducts, topCollections, customerAnalytics]) => {
      if (cancelled) return;
      setData({ metrics, series, topProducts, topCollections, customerAnalytics });
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [mounted, rangeKey, custom]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Analytics" description="Performance across your store." />
      <AnalyticsNav />

      <div className="flex justify-end">
        <DateRangePicker
          value={rangeKey}
          custom={custom}
          onChange={(key, c) => {
            setRangeKey(key);
            setCustom(key === "custom" ? c : null);
          }}
        />
      </div>

      {!mounted || loading || !data ? (
        <SkeletonCards count={5} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
            <StatCard label="Revenue" value={formatCurrency(data.metrics.revenue.value)} change={data.metrics.revenue.change} />
            <StatCard label="Orders" value={data.metrics.orders.value} change={data.metrics.orders.change} />
            <StatCard label="Avg. Order Value" value={formatCurrency(data.metrics.aov.value)} change={data.metrics.aov.change} />
            <StatCard label="Customers" value={data.metrics.customers.value} change={data.metrics.customers.change} />
            <StatCard label="Conversion Rate" value={`${data.metrics.conversionRate.value.toFixed(1)}%`} change={data.metrics.conversionRate.change} />
          </div>

          <Panel>
            <PanelHeader title="Revenue" description="Compared to the previous period" />
            <LineChart data={data.series} formatValue={formatCurrency} />
          </Panel>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Panel className="lg:col-span-1">
              <PanelHeader title="Top Products" />
              <BarList items={data.topProducts.map((p) => ({ label: p.product.title, value: p.revenue }))} formatValue={formatCurrency} />
            </Panel>
            <Panel className="lg:col-span-1">
              <PanelHeader title="Top Collections" />
              <BarList items={data.topCollections.map((c) => ({ label: c.collection.title, value: c.revenue }))} formatValue={formatCurrency} color="var(--admin-info)" />
            </Panel>
            <Panel className="lg:col-span-1">
              <PanelHeader title="New vs Returning" />
              <SplitBar
                segments={[
                  { label: "New", value: data.customerAnalytics.newCount, color: "var(--color-primary)" },
                  { label: "Returning", value: data.customerAnalytics.returningCount, color: "var(--admin-info)" },
                ]}
              />
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
