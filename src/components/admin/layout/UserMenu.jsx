"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Settings, ExternalLink } from "lucide-react";
import { CURRENT_STAFF } from "@/lib/admin/utils/current-user";
import { avatarColor, initials } from "@/lib/admin/utils/avatar";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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
        aria-label={`Account menu for ${CURRENT_STAFF.name}`}
        className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium text-white"
        style={{ backgroundColor: avatarColor(CURRENT_STAFF.tone) }}
      >
        {initials(CURRENT_STAFF.name)}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-56 border border-[var(--admin-border)] bg-[var(--admin-surface)] py-1.5 shadow-lg">
          <div className="border-b border-[var(--admin-border)] px-4 py-3">
            <p className="truncate text-sm font-medium text-[var(--admin-text)]">{CURRENT_STAFF.name}</p>
            <p className="truncate text-xs text-[var(--admin-text-muted)]">{CURRENT_STAFF.email}</p>
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
        </div>
      )}
    </div>
  );
}
