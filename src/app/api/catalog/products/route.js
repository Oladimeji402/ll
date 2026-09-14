import { NextResponse } from "next/server";
import { getAllProducts, searchProducts } from "@/lib/supabase/queries/catalog";

export async function GET(request) {
  const limit = Number(request.nextUrl.searchParams.get("limit")) || undefined;
  const q = request.nextUrl.searchParams.get("q");

  if (q) {
    const results = await searchProducts(q, limit ?? 8);
    return NextResponse.json(results);
  }

  const products = await getAllProducts();
  return NextResponse.json(limit ? products.slice(0, limit) : products);
}
