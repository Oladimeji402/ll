import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/supabase/queries/catalog";

export async function GET(request) {
  const limit = Number(request.nextUrl.searchParams.get("limit")) || undefined;
  const products = await getAllProducts();
  return NextResponse.json(limit ? products.slice(0, limit) : products);
}
