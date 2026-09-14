"use server";

import { createClient } from "@/lib/supabase/server";

export async function placeOrder(cartItems, shippingAddress) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to sign in to place an order." };
  }

  if (!cartItems?.length) {
    return { error: "Your bag is empty." };
  }

  const items = cartItems.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    size: item.size,
  }));

  const { data, error } = await supabase
    .rpc("create_order", {
      p_items: items,
      p_shipping_address: shippingAddress,
      p_shipping_cost: 0,
    })
    .single();

  if (error) {
    return { error: "Couldn't place your order. Please try again." };
  }

  return { orderNumber: data.order_number };
}
