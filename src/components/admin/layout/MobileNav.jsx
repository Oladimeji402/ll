"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import Overlay, { DialogCloseButton } from "../ui/Overlay";
import { NAV_SECTIONS } from "./nav-config";

function isActive(pathname, item) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function MobileNav({ open, onClose }) {
  const pathname = usePathname();

  return (
    <Overlay open={open} onClose={onClose} labelledBy="mobile-nav-title">
      <div className="flex h-full" onClick={onClose}>
        <div
          className="flex h-full w-[84%] max-w-xs flex-col overflow-y-auto bg-[var(--admin-sidebar-bg)] text-[var(--admin-sidebar-fg)] shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-5">
            <div id="mobile-nav-title" data-autofocus tabIndex={-1}>
              <p className="font-serif text-lg">LL Collectives</p>
              <p className="tracking-nav text-[10px] uppercase text-[var(--admin-sidebar-fg-muted)]">Admin</p>
            </div>
            <DialogCloseButton onClose={onClose} className="text-white hover:bg-[var(--admin-sidebar-active)] hover:text-white" />
          </div>

          <nav className="flex-1 px-3 pb-4">
            {NAV_SECTIONS.map((section) => (
              <div key={section.heading} className="mb-5">
                <p className="tracking-nav mb-2 px-2 text-[10px] uppercase text-[var(--admin-sidebar-fg-muted)]">
                  {section.heading}
                </p>
                <ul className="flex flex-col gap-0.5">
                  {section.items.map((item) => {
                    const active = isActive(pathname, item);
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-3 px-2.5 py-2.5 text-sm",
                            active ? "bg-[var(--admin-sidebar-active)] text-white" : "text-[var(--admin-sidebar-fg-muted)]",
                          )}
                        >
                          <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                          {item.label}
                        </Link>
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
              className="flex items-center gap-3 px-2.5 py-2.5 text-sm text-[var(--admin-sidebar-fg-muted)]"
            >
              <ExternalLink className="h-[18px] w-[18px]" strokeWidth={1.75} />
              View Store
            </Link>
          </div>
        </div>
      </div>
    </Overlay>
  );
}
