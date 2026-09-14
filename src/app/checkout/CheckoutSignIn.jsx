"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MODES = { SIGN_IN: "sign-in", SIGN_UP: "sign-up" };

export default function CheckoutSignIn() {
  const router = useRouter();
  const [mode, setMode] = useState(MODES.SIGN_IN);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  function updateField(field) {
    return (event) => setForm((f) => ({ ...f, [field]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");
    const supabase = createClient();

    if (mode === MODES.SIGN_IN) {
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
      return;
    }

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

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="font-serif text-2xl text-[var(--color-primary)]">
        {mode === MODES.SIGN_IN ? "Sign In to Checkout" : "Create an Account"}
      </h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Your bag is saved — sign in to continue to checkout.
      </p>

      {notice && <p className="mt-4 text-sm text-[var(--color-text-muted)]">{notice}</p>}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
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
    </div>
  );
}
