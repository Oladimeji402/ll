import { NextResponse } from "next/server";
import { getAllCollections } from "@/lib/supabase/queries/catalog";

export async function GET() {
  const collections = await getAllCollections();
  return NextResponse.json(collections);
}
