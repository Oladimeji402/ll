"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ShoppingBag, Tag, Layers } from "lucide-react";
import Panel, { PanelHeader } from "@/components/admin/ui/Panel";
import Button from "@/components/admin/ui/Button";
import Badge, { StatusBadge } from "@/components/admin/ui/Badge";
import StatCard from "@/components/admin/ui/StatCard";
import DateRangePicker from "@/components/admin/ui/DateRangePicker";
import LineChart from "@/components/admin/ui/charts/LineChart";
import SplitBar from "@/components/admin/ui/charts/SplitBar";
import { SkeletonCards } from "@/components/admin/ui/Skeleton";
import EmptyState from "@/components/admin/ui/EmptyState";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { formatCurrency, formatDate } from "@/lib/admin/utils/format";
import { useCurrentStaff } from "@/components/admin/layout/CurrentStaffContext";
import {
  getDashboardMetrics,
  getSalesSeries,
  getTopProducts,
  getCustomerAnalytics,
  getInventoryAttention,
} from "@/lib/admin/services/analytics-service";
import { listOrders } from "@/lib/admin/services/order-service";

const METRIC_TOGGLES = [
  { key: "revenue", label: "Revenue" },
  { key: "orders", label: "Orders" },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const staff = useCurrentStaff();
  const mounted = useMounted();
  const [rangeKey, setRangeKey] = useState("last30");
  const [custom, setCustom] = useState(null);
  const [metric, setMetric] = useState("revenue");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getDashboardMetrics(rangeKey, custom),
      getSalesSeries(rangeKey, custom, metric),
      getTopProducts(rangeKey, custom, 5),
      getCustomerAnalytics(rangeKey, custom),
      listOrders({ page: 1, pageSize: 6, sort: { field: "createdAt", direction: "desc" } }),
    ]).then(([metrics, series, topProducts, customerAnalytics, recentOrders]) => {
      if (cancelled) return;
      setData({
        metrics,
        series,
        topProducts,
        customerAnalytics,
        recentOrders: recentOrders.items,
        inventoryAttention: getInventoryAttention(5),
      });
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [mounted, rangeKey, custom, metric]);

  const handleRangeChange = (key, customValue) => {
    setRangeKey(key);
    setCustom(key === "custom" ? customValue : null);
  };

  if (!mounted || loading || !data) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-72 admin-skeleton" />
        <SkeletonCards count={5} />
        <div className="h-72 admin-skeleton" />
      </div>
    );
  }

  const { metrics, series, topProducts, customerAnalytics, recentOrders, inventoryAttention } = data;
  const firstName = staff.name.split(" ")[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-[var(--admin-text)]">
            {greeting()}, {firstName}.
          </h1>
          <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
            Here&apos;s what&apos;s happening with LL Collectives.
          </p>
        </div>
        <DateRangePicker value={rangeKey} custom={custom} onChange={handleRangeChange} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Revenue" value={formatCurrency(metrics.revenue.value)} change={metrics.revenue.change} />
        <StatCard label="Orders" value={metrics.orders.value} change={metrics.orders.change} />
        <StatCard label="Avg. Order Value" value={formatCurrency(metrics.aov.value)} change={metrics.aov.change} />
        <StatCard label="Customers" value={metrics.customers.value} change={metrics.customers.change} />
        <StatCard label="Conversion Rate" value={`${metrics.conversionRate.value.toFixed(1)}%`} change={metrics.conversionRate.change} />
      </div>

      <Panel>
        <PanelHeader
          title="Sales Overview"
          description="Compared to the previous period"
          actions={
            <div className="flex border border-[var(--admin-border)]">
              {METRIC_TOGGLES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setMetric(t.key)}
                  className={`px-3 py-1.5 text-xs font-medium ${
                    metric === t.key ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]" : "text-[var(--admin-text-muted)]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          }
        />
        <LineChart data={series} formatValue={metric === "revenue" ? formatCurrency : (v) => v} />
      </Panel>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2" padded={false}>
          <PanelHeader title="Recent Orders" actions={<Link href="/admin/orders" className="text-xs font-medium text-[var(--color-primary)] hover:underline">View all</Link>} className="px-5 pt-5 sm:px-6" />
          {recentOrders.length === 0 ? (
            <EmptyState icon={ShoppingBag} title="No orders yet" description="Orders will show up here once customers start checking out." />
          ) : (
            <div className="divide-y divide-[var(--admin-border)]">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm hover:bg-[var(--admin-surface-alt)] sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--admin-text)]">{order.orderNumber}</p>
                    <p className="truncate text-xs text-[var(--admin-text-muted)]">
                      {order.customerName} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="hidden shrink-0 items-center gap-2 sm:flex">
                    <StatusBadge status={order.paymentStatus} />
                    <StatusBadge status={order.fulfillmentStatus} />
                  </div>
                  <p className="shrink-0 font-medium text-[var(--admin-text)]">{formatCurrency(order.total)}</p>
                </Link>
              ))}
            </div>
          )}
        </Panel>

        <Panel>
          <PanelHeader title="Top Products" />
          <div className="flex flex-col gap-4">
            {topProducts.map(({ product, unitsSold, revenue }) => (
              <Link key={product.id} href={`/admin/products/${product.id}`} className="flex items-start gap-3">
                <div className="h-11 w-11 shrink-0 overflow-hidden">
                  <PlaceholderImage tone={product.images[0]?.tone ?? 0} alt={product.title} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug text-[var(--admin-text)]">{product.title}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--admin-text-muted)]">
                    <span>{unitsSold} sold</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-[var(--admin-text)]">{formatCurrency(revenue)}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHeader title="Inventory Attention" description="Products running low or unavailable" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">Low stock</p>
              <div className="flex flex-col gap-2">
                {inventoryAttention.lowStock.length === 0 && <p className="text-sm text-[var(--admin-text-muted)]">Nothing low on stock.</p>}
                {inventoryAttention.lowStock.map((item) => (
                  <Link key={item.id} href="/admin/inventory" className="flex items-center justify-between text-sm hover:text-[var(--color-primary)]">
                    <span className="truncate text-[var(--admin-text)]">{item.productTitle}</span>
                    <Badge tone="warning">{item.available} left</Badge>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">Out of stock</p>
              <div className="flex flex-col gap-2">
                {inventoryAttention.outOfStock.length === 0 && <p className="text-sm text-[var(--admin-text-muted)]">Nothing out of stock.</p>}
                {inventoryAttention.outOfStock.map((item) => (
                  <Link key={item.id} href="/admin/inventory" className="flex items-center justify-between text-sm hover:text-[var(--color-primary)]">
                    <span className="truncate text-[var(--admin-text)]">{item.productTitle}</span>
                    <Badge tone="danger">0 left</Badge>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Customer Insights" />
          <SplitBar
            segments={[
              { label: "New", value: customerAnalytics.newCount, color: "var(--color-primary)" },
              { label: "Returning", value: customerAnalytics.returningCount, color: "var(--admin-info)" },
            ]}
          />
          <div className="mt-5 border-t border-[var(--admin-border)] pt-4">
            <p className="text-xs text-[var(--admin-text-muted)]">Repeat purchase rate</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--admin-text)]">{customerAnalytics.repeatPurchaseRate.toFixed(1)}%</p>
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHeader title="Quick Actions" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Button as={Link} href="/admin/products/new" variant="secondary" className="justify-start">
            <Plus className="h-4 w-4" /> Add product
          </Button>
          <Button as={Link} href="/admin/orders" variant="secondary" className="justify-start">
            <ShoppingBag className="h-4 w-4" /> View orders
          </Button>
          <Button as={Link} href="/admin/discounts/new" variant="secondary" className="justify-start">
            <Tag className="h-4 w-4" /> Create discount
          </Button>
          <Button as={Link} href="/admin/collections?new=1" variant="secondary" className="justify-start">
            <Layers className="h-4 w-4" /> Add collection
          </Button>
        </div>
      </Panel>
    </div>
  );
}
