"use client";

import { usePathname } from "next/navigation";
import Tabs from "@/components/admin/ui/Tabs";
import { useRouter } from "next/navigation";

const TABS = [
  { value: "/admin/analytics", label: "Overview" },
  { value: "/admin/analytics/sales", label: "Sales" },
  { value: "/admin/analytics/products", label: "Products" },
  { value: "/admin/analytics/customers", label: "Customers" },
];

export default function AnalyticsNav() {
  const pathname = usePathname();
  const router = useRouter();
  return <Tabs tabs={TABS} value={pathname} onChange={(v) => router.push(v)} />;
}
