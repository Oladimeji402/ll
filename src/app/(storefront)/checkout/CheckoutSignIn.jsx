"use client";

import { useRouter } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";

export default function CheckoutSignIn() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="font-serif text-2xl text-[var(--color-primary)]">Sign In to Checkout</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Your bag is saved — sign in to continue to checkout.
      </p>

      <div className="mt-6">
        <AuthForm onSuccess={() => router.refresh()} />
      </div>
    </div>
  );
}
