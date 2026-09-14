"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(state, formData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to sign in." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = {
    line1: String(formData.get("line1") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    state: String(formData.get("state") ?? "").trim(),
    country: String(formData.get("country") ?? "").trim(),
    postalCode: String(formData.get("postalCode") ?? "").trim(),
  };

  if (!name) {
    return { error: "Name can't be empty." };
  }

  const { error } = await supabase
    .from("customers")
    .upsert({ id: user.id, email: user.email, name, phone, address });

  if (error) {
    return { error: "Couldn't save your changes. Try again." };
  }

  revalidatePath("/account/profile");
  return { success: true };
}
