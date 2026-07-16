import { NextResponse } from "next/server";
import * as reviews from "@/features/admin/artwork-verification/server/reviews";

export async function GET() {
  try {
    const activity = await reviews.getReviewActivity();
    return NextResponse.json({ success: true, data: activity });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch activity";
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}