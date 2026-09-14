import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/config/site";
import ProfileForm from "./ProfileForm";

export const metadata = {
  title: `My Profile — ${siteConfig.brandName}`,
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("name, email, phone, address")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-20 pt-16 sm:pt-20">
      <h1 className="font-serif text-3xl text-[var(--color-primary)] sm:text-4xl">My Profile</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Update your contact details and default shipping address.
      </p>

      <ProfileForm customer={customer ?? { name: "", email: user.email, phone: "", address: {} }} />
    </main>
  );
}
