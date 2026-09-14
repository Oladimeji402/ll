"use client";

import { useActionState, useState } from "react";
import { cn } from "@/lib/utils";
import { updateProfile } from "./actions";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { useNigeriaStates, useNigeriaCities } from "@/hooks/useNigeriaGeo";

function Field({ label, className, ...rest }) {
  return (
    <label className={cn("block", className)}>
      <span className="text-sm text-[var(--color-text)]">{label}</span>
      <input
        {...rest}
        className="mt-2 w-full border border-[var(--color-line)] bg-transparent px-4 py-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] disabled:opacity-60"
      />
    </label>
  );
}

export default function ProfileForm({ customer }) {
  const [formState, action, pending] = useActionState(updateProfile, undefined);
  const address = customer.address ?? {};

  const [stateValue, setStateValue] = useState(address.state ?? "");
  const [cityValue, setCityValue] = useState(address.city ?? "");
  const stateOptions = useNigeriaStates();
  const cityOptions = useNigeriaCities(stateValue);

  return (
    <form action={action} className="mt-8 flex max-w-lg flex-col gap-5">
      <Field label="Email" type="email" value={customer.email} disabled />
      <Field label="Full name" name="name" type="text" required defaultValue={customer.name} />
      <Field label="Phone" name="phone" type="tel" defaultValue={customer.phone} />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Address line" name="line1" type="text" defaultValue={address.line1} className="col-span-2" />

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

        <Field label="Postal code" name="postalCode" type="text" defaultValue={address.postalCode} />
        <Field label="Country" name="country" type="text" defaultValue={address.country || "Nigeria"} />
      </div>

      {formState?.error && (
        <p className="text-sm text-red-600" role="alert">
          {formState.error}
        </p>
      )}
      {formState?.success && <p className="text-sm text-[var(--color-text-muted)]">Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="tracking-nav mt-2 w-full bg-[var(--color-primary)] py-3 text-xs uppercase text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {pending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
