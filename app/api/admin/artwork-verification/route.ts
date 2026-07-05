// ============================================
// GET /api/admin/artwork-verification - Get review queue (paginated)
// ============================================

import { NextRequest, NextResponse } from "next/server";
import * as reviews from "@/features/admin/artwork-verification/server/reviews";

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());

    const page = parseInt(searchParams.page ?? "1");
    const limit = parseInt(searchParams.limit ?? "20");

    const result = await reviews.getReviewQueue({
      page,
      limit,
      status: searchParams.status,
      similarity: searchParams.similarity,
      date: searchParams.date,
      artist: searchParams.artist,
      reviewer: searchParams.reviewer,
      source: searchParams.source,
      search: searchParams.search,
      sortBy: searchParams.sortBy ?? "highest_similarity",
      sortOrder: "desc",
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch reviews";
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}