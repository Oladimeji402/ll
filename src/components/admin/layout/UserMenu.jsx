"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Settings, ExternalLink, LogOut } from "lucide-react";
import { useCurrentStaff } from "./CurrentStaffContext";
import { avatarColor, initials, toneFromString } from "@/lib/admin/utils/avatar";
import { signOutStaff } from "@/app/admin/login/actions";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const staff = useCurrentStaff();

  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Account menu for ${staff.name}`}
        className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium text-white"
        style={{ backgroundColor: avatarColor(toneFromString(staff.email)) }}
      >
        {initials(staff.name)}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-56 border border-[var(--admin-border)] bg-[var(--admin-surface)] py-1.5 shadow-lg">
          <div className="border-b border-[var(--admin-border)] px-4 py-3">
            <p className="truncate text-sm font-medium text-[var(--admin-text)]">{staff.name}</p>
            <p className="truncate text-xs text-[var(--admin-text-muted)]">{staff.email}</p>
          </div>
          <Link
            href="/admin/settings/preferences"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2 text-sm text-[var(--admin-text)] hover:bg-[var(--admin-surface-alt)]"
          >
            <Settings className="h-4 w-4 text-[var(--admin-text-muted)]" />
            Preferences
          </Link>
          <Link
            href="/"
            target="_blank"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2 text-sm text-[var(--admin-text)] hover:bg-[var(--admin-surface-alt)]"
          >
            <ExternalLink className="h-4 w-4 text-[var(--admin-text-muted)]" />
            View Store
          </Link>
          <form action={signOutStaff} className="border-t border-[var(--admin-border)]">
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-[var(--admin-text)] hover:bg-[var(--admin-surface-alt)]"
            >
              <LogOut className="h-4 w-4 text-[var(--admin-text-muted)]" />
              Sign Out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
