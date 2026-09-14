import { NextResponse } from "next/server";
import { getLgasForState } from "@/lib/geo/ng-locations";

export async function GET(request) {
  const state = request.nextUrl.searchParams.get("state") ?? "";
  return NextResponse.json(getLgasForState(state));
}
