import { redirect, notFound } from "next/navigation";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { createClient } from "@/lib/supabase/server";
import { getMyOrderByNumber } from "@/lib/supabase/queries/orders";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/config/site";

const STATUS_LABELS = {
  pending: "Payment pending",
  paid: "Paid",
  failed: "Payment failed",
  refunded: "Refunded",
};

export async function generateMetadata({ params }) {
  const { orderNumber } = await params;
  return { title: `Order ${orderNumber} — ${siteConfig.brandName}` };
}

export default async function OrderDetailPage({ params }) {
  const { orderNumber } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const order = await getMyOrderByNumber(orderNumber);
  if (!order) notFound();

  const address = order.shippingAddress ?? {};

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-20 pt-16 sm:pt-20">
      <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Order</p>
      <h1 className="font-serif text-3xl text-[var(--color-primary)] sm:text-4xl">{order.orderNumber}</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Placed{" "}
        {new Date(order.createdAt).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}{" "}
        · {STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
      </p>

      <div className="mt-10 grid gap-10 sm:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="font-serif text-lg text-[var(--color-primary)]">Items</h2>
          <ul className="mt-4 flex flex-col gap-4">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-4">
                <div className="relative h-20 w-16 shrink-0 bg-[var(--color-image-bg)]">
                  <PlaceholderImage tone={item.tone} alt={item.title} fill />
                </div>
                <div className="flex flex-1 flex-col justify-center">
                  <p className="text-sm text-[var(--color-text)]">{item.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Size {item.variant} · Qty {item.quantity}
                  </p>
                </div>
                <p className="self-center text-sm text-[var(--color-primary)]">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-1.5 border-t border-[var(--color-line)] pt-4 text-sm">
            <div className="flex justify-between text-[var(--color-text-muted)]">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[var(--color-text-muted)]">
              <span>Shipping</span>
              <span>{formatPrice(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between text-base text-[var(--color-primary)]">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-serif text-lg text-[var(--color-primary)]">Shipping Address</h2>
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">
            {address.line1}
            <br />
            {address.city}, {address.state}
            <br />
            {address.postalCode} {address.country}
            <br />
            {address.phone}
          </p>
        </div>
      </div>
    </main>
  );
}
