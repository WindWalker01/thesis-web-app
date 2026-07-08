import { NextRequest, NextResponse } from "next/server";
import {
  bulkArchive,
  bulkHide,
  bulkDelete,
  bulkApprove,
  bulkMarkReview,
} from "@/features/admin/artwork-management/server/admin-actions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, artworkIds } = body;

    if (!Array.isArray(artworkIds) || artworkIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "No artworks selected" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "archive":
        result = await bulkArchive(artworkIds);
        break;
      case "hide":
        result = await bulkHide(artworkIds);
        break;
      case "delete":
        result = await bulkDelete(artworkIds);
        break;
      case "approve":
        result = await bulkApprove(artworkIds);
        break;
      case "mark_review":
        result = await bulkMarkReview(artworkIds);
        break;
      default:
        return NextResponse.json(
          { success: false, message: `Unknown bulk action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to perform bulk action",
      },
      { status: 500 }
    );
  }
}