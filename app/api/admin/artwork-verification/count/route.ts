import { NextResponse } from "next/server";
import * as reviews from "@/features/admin/artwork-verification/server/reviews";

export async function GET() {
  try {
    const count = await reviews.getPendingReviewCount();
    return NextResponse.json({ success: true, data: count });
  } catch {
    return NextResponse.json({ success: true, data: 0 });
  }
}