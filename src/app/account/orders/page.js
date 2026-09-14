import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { getMyOrders } from "@/lib/supabase/queries/orders";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: `My Orders — ${siteConfig.brandName}`,
};

const STATUS_LABELS = {
  pending: "Payment pending",
  paid: "Paid",
  failed: "Payment failed",
  refunded: "Refunded",
};

export default async function OrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const orders = await getMyOrders();

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-20 pt-16 sm:pt-20">
        <h1 className="font-serif text-3xl text-[var(--color-primary)] sm:text-4xl">My Orders</h1>

        {orders.length === 0 ? (
          <p className="mx-auto mt-4 max-w-md text-center text-sm text-[var(--color-text-muted)]">
            You haven&apos;t placed any orders yet. Once you check out, your order history will show up here.
          </p>
        ) : (
          <ul className="mt-8 flex flex-col divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/account/orders/${order.orderNumber}`}
                  className="flex items-center justify-between gap-4 py-5 hover:bg-[var(--color-image-bg)]/40"
                >
                  <div>
                    <p className="text-sm text-[var(--color-text)]">{order.orderNumber}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      {new Date(order.createdAt).toLocaleDateString("en-NG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      · {STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
                    </p>
                  </div>
                  <p className="text-sm text-[var(--color-primary)]">{formatPrice(order.total)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <Footer />
    </>
  );
}
