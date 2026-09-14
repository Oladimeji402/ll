"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signInStaff(state, formData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: "Incorrect email or password." };
  }

  const { data: staff } = await supabase
    .from("staff_members")
    .select("status")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!staff || staff.status !== "active") {
    await supabase.auth.signOut();
    return { error: "This account doesn't have admin access." };
  }

  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function signOutStaff() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
