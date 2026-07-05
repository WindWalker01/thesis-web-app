import { NextResponse } from "next/server";
import * as reviews from "@/features/admin/artwork-verification/server/reviews";

export async function GET() {
  try {
    const stats = await reviews.getReviewStatistics();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch stats";
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}