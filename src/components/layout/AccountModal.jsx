"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useSupabaseUser } from "@/lib/supabase/use-user";
import AuthForm from "@/components/auth/AuthForm";

export default function AccountModal({ open, onClose }) {
  const router = useRouter();
  const user = useSupabaseUser();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-5 transition-opacity duration-300",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <div
        className={cn(
          "relative w-full max-w-sm bg-[var(--color-surface)] p-8 shadow-xl transition-all duration-300",
          open ? "scale-100 opacity-100" : "scale-95 opacity-0",
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-xl leading-none text-[var(--color-text-muted)]"
        >
          &times;
        </button>

        {user === undefined && <div className="h-48" aria-hidden="true" />}

        {user === null && <AuthForm key={String(open)} heading="Sign In" onSuccess={() => router.refresh()} />}

        {user && (
          <>
            <h2 className="font-serif text-2xl text-[var(--color-primary)]">
              Hi, {(user.user_metadata?.name || user.email).split(" ")[0]}
            </h2>
            <p className="mt-1 truncate text-sm text-[var(--color-text-muted)]">{user.email}</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                href="/account/orders"
                onClick={onClose}
                className="tracking-nav border border-[var(--color-line)] py-3 text-center text-[10px] uppercase text-[var(--color-text-muted)] hover:border-[var(--color-text)]"
              >
                Orders
              </Link>
              <Link
                href="/account/profile"
                onClick={onClose}
                className="tracking-nav border border-[var(--color-line)] py-3 text-center text-[10px] uppercase text-[var(--color-text-muted)] hover:border-[var(--color-text)]"
              >
                Profile
              </Link>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="tracking-nav mt-3 w-full border border-[var(--color-text)] py-3 text-xs uppercase text-[var(--color-text)] transition-colors hover:bg-[var(--color-text)] hover:text-[var(--color-surface)]"
            >
              Sign Out
            </button>
          </>
        )}
      </div>
    </div>
  );
}
