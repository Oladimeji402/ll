"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useSupabaseUser } from "@/lib/supabase/use-user";

const MODES = { SIGN_IN: "sign-in", SIGN_UP: "sign-up" };

export default function AccountModal({ open, onClose }) {
  const router = useRouter();
  const user = useSupabaseUser();
  const [mode, setMode] = useState(MODES.SIGN_IN);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    setNotice("");
    setForm({ name: "", email: "", password: "" });
  }, [open, mode]);

  function updateField(field) {
    return (event) => setForm((f) => ({ ...f, [field]: event.target.value }));
  }

  async function handleSignIn(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    setPending(false);
    if (signInError) {
      setError("Incorrect email or password.");
      return;
    }
    router.refresh();
  }

  async function handleSignUp(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name } },
    });
    setPending(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (!data.session) {
      setNotice("Check your email to confirm your account, then sign in.");
      setMode(MODES.SIGN_IN);
      return;
    }
    router.refresh();
  }

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

        {user === null && (
          <>
            <h2 className="font-serif text-2xl text-[var(--color-primary)]">
              {mode === MODES.SIGN_IN ? "Sign In" : "Create Account"}
            </h2>

            {notice && <p className="mt-4 text-sm text-[var(--color-text-muted)]">{notice}</p>}

            <form
              onSubmit={mode === MODES.SIGN_IN ? handleSignIn : handleSignUp}
              className="mt-6 flex flex-col gap-3"
            >
              {mode === MODES.SIGN_UP && (
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={form.name}
                  onChange={updateField("name")}
                  className="border border-[var(--color-line)] bg-transparent px-3 py-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
                />
              )}
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="Email"
                value={form.email}
                onChange={updateField("email")}
                className="border border-[var(--color-line)] bg-transparent px-3 py-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
              />
              <input
                type="password"
                required
                autoComplete={mode === MODES.SIGN_IN ? "current-password" : "new-password"}
                placeholder="Password"
                value={form.password}
                onChange={updateField("password")}
                className="border border-[var(--color-line)] bg-transparent px-3 py-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
              />

              {error && (
                <p className="text-xs text-red-600" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="tracking-nav mt-1 w-full bg-[var(--color-primary)] py-3 text-xs uppercase text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
              >
                {pending ? "Please wait…" : mode === MODES.SIGN_IN ? "Sign In" : "Create Account"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setMode(mode === MODES.SIGN_IN ? MODES.SIGN_UP : MODES.SIGN_IN)}
              className="tracking-nav mt-3 w-full border border-[var(--color-text)] py-3 text-xs uppercase text-[var(--color-text)] transition-colors hover:bg-[var(--color-text)] hover:text-[var(--color-surface)]"
            >
              {mode === MODES.SIGN_IN ? "Create Account" : "Sign In Instead"}
            </button>
          </>
        )}

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
