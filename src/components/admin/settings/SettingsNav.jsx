"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { href: "/admin/settings/store", label: "Store" },
  { href: "/admin/settings/checkout", label: "Checkout" },
  { href: "/admin/settings/payments", label: "Payments" },
  { href: "/admin/settings/shipping", label: "Shipping" },
  { href: "/admin/settings/notifications", label: "Notifications" },
  { href: "/admin/settings/email", label: "Email" },
  { href: "/admin/settings/seo", label: "SEO" },
  { href: "/admin/settings/preferences", label: "Admin Preferences" },
];

export default function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-[var(--admin-border)] pb-px lg:w-56 lg:flex-col lg:overflow-visible lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
      {SECTIONS.map((section) => {
        const active = pathname === section.href;
        return (
          <Link
            key={section.href}
            href={section.href}
            className={cn(
              "shrink-0 whitespace-nowrap px-3 py-2 text-sm lg:whitespace-normal",
              active
                ? "bg-[var(--admin-surface-alt)] font-medium text-[var(--admin-text)] lg:border-r-2 lg:border-[var(--color-primary)]"
                : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]",
            )}
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
