import { NextResponse } from "next/server";
import { NG_STATES } from "@/lib/geo/ng-locations";

export async function GET() {
  return NextResponse.json(NG_STATES);
}
