import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/config/site";
import CheckoutForm from "./CheckoutForm";
import CheckoutSignIn from "./CheckoutSignIn";

export const metadata = {
  title: `Checkout — ${siteConfig.brandName}`,
};

export default async function CheckoutPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let customer = null;
  if (user) {
    const { data } = await supabase
      .from("customers")
      .select("name, email, phone, address")
      .eq("id", user.id)
      .maybeSingle();
    customer = data ?? { name: "", email: user.email, phone: "", address: {} };
  }

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-20 pt-16 sm:pt-20">
        <h1 className="mb-10 text-center font-serif text-3xl text-[var(--color-primary)] sm:text-4xl">
          Checkout
        </h1>

        {customer ? <CheckoutForm customer={customer} /> : <CheckoutSignIn />}
      </main>

      <Footer />
    </>
  );
}
