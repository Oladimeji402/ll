"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Field from "@/components/admin/ui/form/Field";
import Input from "@/components/admin/ui/form/Input";
import Button from "@/components/admin/ui/Button";
import { signInStaff } from "./actions";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";
  const unauthorized = searchParams.get("error") === "unauthorized";

  const [state, action, pending] = useActionState(signInStaff, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--admin-bg)] px-4">
      <div className="w-full max-w-sm border border-[var(--admin-border)] bg-[var(--admin-surface)] p-8 shadow-sm">
        <h1 className="font-serif text-2xl text-[var(--admin-text)]">Admin Sign In</h1>
        <p className="mt-1 text-sm text-[var(--admin-text-muted)]">LL Collectives store operations.</p>

        {unauthorized && (
          <p className="mt-4 border border-[var(--admin-danger)]/30 bg-[var(--admin-danger)]/10 px-3 py-2 text-sm text-[var(--admin-danger)]">
            That account doesn&apos;t have admin access.
          </p>
        )}

        <form action={action} className="mt-6 flex flex-col gap-4">
          <input type="hidden" name="next" value={next} />

          <Field label="Email" htmlFor="email" required>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </Field>

          <Field label="Password" htmlFor="password" required>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </Field>

          {state?.error && (
            <p className="text-sm text-[var(--admin-danger)]" role="alert">
              {state.error}
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" loading={pending} className="mt-2 w-full">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
