"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore, useCartSubtotal } from "@/lib/store/cart-store";
import { useNigeriaStates, useNigeriaCities } from "@/hooks/useNigeriaGeo";
import { useMounted } from "@/hooks/useMounted";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { placeOrder } from "./actions";

function Field({ label, className, ...rest }) {
  return (
    <label className={cn("block", className)}>
      <span className="text-sm text-[var(--color-text)]">{label}</span>
      <input
        {...rest}
        className="mt-2 w-full border border-[var(--color-line)] bg-transparent px-4 py-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
      />
    </label>
  );
}

export default function CheckoutForm({ customer }) {
  const router = useRouter();
  const mounted = useMounted();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = useCartSubtotal();

  const address = customer.address ?? {};
  const [form, setForm] = useState({
    phone: customer.phone ?? "",
    line1: address.line1 ?? "",
    postalCode: address.postalCode ?? "",
    country: address.country || "Nigeria",
  });
  const [stateValue, setStateValue] = useState(address.state ?? "");
  const [cityValue, setCityValue] = useState(address.city ?? "");
  const stateOptions = useNigeriaStates();
  const cityOptions = useNigeriaCities(stateValue);

  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function updateField(field) {
    return (event) => setForm((f) => ({ ...f, [field]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!items.length) {
      setError("Your bag is empty.");
      return;
    }
    if (!form.line1 || !stateValue || !cityValue) {
      setError("Fill in your full shipping address.");
      return;
    }

    setPending(true);
    const result = await placeOrder(items, {
      line1: form.line1,
      city: cityValue,
      state: stateValue,
      postalCode: form.postalCode,
      country: form.country,
      phone: form.phone,
    });
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    clearCart();
    router.push(`/account/orders/${result.orderNumber}`);
  }

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <p className="text-sm text-[var(--color-text-muted)]">Your bag is empty.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-[1.2fr_1fr]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <h2 className="font-serif text-xl text-[var(--color-primary)]">Shipping Address</h2>

        <Field label="Phone" type="tel" value={form.phone} onChange={updateField("phone")} required />
        <Field label="Address line" type="text" value={form.line1} onChange={updateField("line1")} required />

        <div className="grid grid-cols-2 gap-4">
          <SearchableSelect
            name="state"
            label="State"
            placeholder="Search states…"
            options={stateOptions}
            value={stateValue}
            onChange={(value) => {
              setStateValue(value);
              setCityValue("");
            }}
          />
          <SearchableSelect
            name="city"
            label="City / LGA"
            placeholder={stateValue ? "Search cities…" : "Choose a state first"}
            options={cityOptions}
            value={cityValue}
            onChange={setCityValue}
            disabled={!stateValue}
          />
          <Field label="Postal code" type="text" value={form.postalCode} onChange={updateField("postalCode")} />
          <Field label="Country" type="text" value={form.country} onChange={updateField("country")} />
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="tracking-nav mt-2 w-full bg-[var(--color-primary)] py-4 text-xs uppercase text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
        >
          {pending ? "Placing Order…" : "Place Order"}
        </button>
        <p className="text-center text-xs text-[var(--color-text-muted)]">
          Payment isn&apos;t collected yet — your order is recorded as pending.
        </p>
      </form>

      <div className="border border-[var(--color-line)] p-6">
        <h2 className="font-serif text-xl text-[var(--color-primary)]">Order Summary</h2>
        <ul className="mt-5 flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4">
              <div className="relative h-20 w-16 shrink-0 bg-[var(--color-image-bg)]">
                <PlaceholderImage tone={item.tone} alt={item.name} fill />
              </div>
              <div className="flex flex-1 flex-col justify-center">
                <p className="text-sm text-[var(--color-text)]">{item.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Size {item.size} · Qty {item.quantity}
                </p>
              </div>
              <p className="self-center text-sm text-[var(--color-primary)]">
                {formatPrice(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-center justify-between border-t border-[var(--color-line)] pt-4 text-sm text-[var(--color-text)]">
          <span>Subtotal</span>
          <span className="text-base text-[var(--color-primary)]">{formatPrice(subtotal)}</span>
        </div>
      </div>
    </div>
  );
}
