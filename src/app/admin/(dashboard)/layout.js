import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/layout/AdminShell";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Admin — LL Collectives",
  description: "LL Collectives store operations.",
};

export default async function AdminLayout({ children }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: staff } = await supabase
    .from("staff_members")
    .select("name, email, role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (!staff || staff.status !== "active") {
    redirect("/admin/login?error=unauthorized");
  }

  return <AdminShell staff={staff}>{children}</AdminShell>;
}
