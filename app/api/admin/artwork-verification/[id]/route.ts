// ============================================
// GET /api/admin/artwork-verification/[id] - Get review detail
// ============================================

import { NextRequest, NextResponse } from "next/server";
import * as reviews from "@/features/admin/artwork-verification/server/reviews";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const detail = await reviews.getReviewDetail(id);

    if (!detail) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Review not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: detail });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch review detail";
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}