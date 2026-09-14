import { redirect } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: `My Orders — ${siteConfig.brandName}`,
};

export default async function OrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-20 pt-16 text-center sm:pt-20">
        <h1 className="font-serif text-3xl text-[var(--color-primary)] sm:text-4xl">My Orders</h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-[var(--color-text-muted)]">
          You haven&apos;t placed any orders yet. Once you check out, your order history will show up here.
        </p>
      </main>

      <Footer />
    </>
  );
}
