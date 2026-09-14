import { NextResponse } from "next/server";
import { getMyOrders } from "@/lib/supabase/queries/orders";

export async function GET() {
  const orders = await getMyOrders();
  return NextResponse.json(orders);
}
