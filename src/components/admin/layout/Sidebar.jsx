"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_SECTIONS } from "./nav-config";
import Tooltip from "../ui/Tooltip";
import { useUiStore } from "@/lib/admin/store/ui-store";
import { useCurrentStaff } from "./CurrentStaffContext";
import { useMounted } from "@/lib/admin/utils/use-mounted";
import { avatarColor, initials, toneFromString } from "@/lib/admin/utils/avatar";

function isActive(pathname, item) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();
  const mounted = useMounted();
  const staff = useCurrentStaff();
  const collapsedPersisted = useUiStore((s) => s.value.sidebarCollapsed);
  const setCollapsed = useUiStore((s) => s._patch);
  const collapsed = mounted && collapsedPersisted;

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[var(--admin-sidebar-border)] bg-[var(--admin-sidebar-bg)] text-[var(--admin-sidebar-fg)] transition-[width] duration-200 lg:flex",
        collapsed ? "w-[76px]" : "w-64",
      )}
    >
      <div className={cn("flex items-center gap-2 px-5 py-6", collapsed && "justify-center px-0")}>
        {!collapsed ? (
          <div>
            <p className="font-serif text-lg leading-tight">LL Collectives</p>
            <p className="tracking-nav text-[10px] uppercase text-[var(--admin-sidebar-fg-muted)]">Admin</p>
          </div>
        ) : (
          <p className="font-serif text-lg">LL</p>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.heading} className="mb-5">
            {!collapsed && (
              <p className="tracking-nav mb-2 px-2 text-[10px] uppercase text-[var(--admin-sidebar-fg-muted)]">
                {section.heading}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = isActive(pathname, item);
                const Icon = item.icon;
                const link = (
                  <Link
                    href={item.href}
                    aria-label={item.label}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 px-2.5 py-2 text-sm transition-colors",
                      collapsed && "justify-center px-0",
                      active
                        ? "bg-[var(--admin-sidebar-active)] text-white"
                        : "text-[var(--admin-sidebar-fg-muted)] hover:bg-[var(--admin-sidebar-active)] hover:text-white",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
                return (
                  <li key={item.href}>
                    {collapsed ? (
                      <Tooltip label={item.label} className="w-full">
                        {link}
                      </Tooltip>
                    ) : (
                      link
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-[var(--admin-sidebar-border)] px-3 py-3">
        <Link
          href="/"
          target="_blank"
          className={cn(
            "flex items-center gap-3 px-2.5 py-2 text-sm text-[var(--admin-sidebar-fg-muted)] hover:bg-[var(--admin-sidebar-active)] hover:text-white",
            collapsed && "justify-center px-0",
          )}
        >
          <ExternalLink className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
          {!collapsed && <span>View Store</span>}
        </Link>

        <Link
          href="/admin/settings"
          className={cn(
            "mt-1 flex items-center gap-3 px-2.5 py-2 hover:bg-[var(--admin-sidebar-active)]",
            collapsed && "justify-center px-0",
          )}
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: avatarColor(toneFromString(staff.email)) }}
            aria-hidden="true"
          >
            {initials(staff.name)}
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-sm text-white">{staff.name}</span>
              <span className="block truncate text-xs text-[var(--admin-sidebar-fg-muted)]">{staff.role}</span>
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={() => setCollapsed({ sidebarCollapsed: !collapsedPersisted })}
          className={cn(
            "mt-2 flex w-full items-center gap-3 px-2.5 py-2 text-sm text-[var(--admin-sidebar-fg-muted)] hover:bg-[var(--admin-sidebar-active)] hover:text-white",
            collapsed && "justify-center px-0",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronsRight className="h-[18px] w-[18px]" strokeWidth={1.75} /> : <ChevronsLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
