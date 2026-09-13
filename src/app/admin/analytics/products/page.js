"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Panel, { PanelHeader } from "@/components/admin/ui/Panel";
import DateRangePicker from "@/components/admin/ui/DateRangePicker";
import DataTable from "@/components/admin/ui/DataTable";
import BarList from "@/components/admin/ui/charts/BarList";
import EmptyState from "@/components/admin/ui/EmptyState";
import AnalyticsNav from "@/components/admin/analytics/AnalyticsNav";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { PieChart } from "lucide-react";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { formatCurrency } from "@/lib/admin/utils/format";
import { getTopProducts, getTopCollections } from "@/lib/admin/services/analytics-service";

export default function ProductsAnalyticsPage() {
  const mounted = useMounted();
  const [rangeKey, setRangeKey] = useState("last30");
  const [custom, setCustom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topProducts, setTopProducts] = useState([]);
  const [topCollections, setTopCollections] = useState([]);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([getTopProducts(rangeKey, custom, 10), getTopCollections(rangeKey, custom, 6)]).then(([p, c]) => {
      if (cancelled) return;
      setTopProducts(p);
      setTopCollections(c);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [mounted, rangeKey, custom]);

  const columns = [
    {
      key: "title",
      header: "Product",
      render: ({ product }) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 overflow-hidden">
            <PlaceholderImage tone={product.images[0]?.tone ?? 0} alt={product.title} />
          </div>
          <span className="truncate text-[var(--admin-text)]">{product.title}</span>
        </div>
      ),
    },
    { key: "unitsSold", header: "Units sold" },
    { key: "revenue", header: "Revenue", render: ({ revenue }) => formatCurrency(revenue) },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Analytics" description="Performance across your store." />
      <AnalyticsNav />

      <div className="flex justify-end">
        <DateRangePicker value={rangeKey} custom={custom} onChange={(key, c) => { setRangeKey(key); setCustom(key === "custom" ? c : null); }} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel padded={false} className="lg:col-span-2">
          <PanelHeader title="Top Products" className="px-5 pt-5 sm:px-6" />
          <DataTable
            columns={columns}
            rows={topProducts}
            rowKey={(row) => row.product.id}
            loading={!mounted || loading}
            empty={<EmptyState icon={PieChart} title="No sales in this period" description="Try a different date range." />}
          />
        </Panel>
        <Panel>
          <PanelHeader title="Top Collections" />
          {topCollections.length === 0 ? (
            <p className="text-sm text-[var(--admin-text-muted)]">No sales in this period.</p>
          ) : (
            <BarList items={topCollections.map((c) => ({ label: c.collection.title, value: c.revenue }))} formatValue={formatCurrency} color="var(--admin-info)" />
          )}
        </Panel>
      </div>
    </div>
  );
}
