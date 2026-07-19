import { NextRequest, NextResponse } from "next/server";
import { getArtworkDetail } from "@/features/admin/artwork-management/server/artworks";
import {
  flagForManualReview,
  approveArtwork,
  setUnderReview,
  markFalsePositive,
  hideArtwork,
  archiveArtwork,
  requestMoreEvidence,
  requestArtistExplanation,
  escalateArtwork,
  registerArtworkBlockchain,
  removeArtwork,
} from "@/features/admin/artwork-management/server/admin-actions";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const detail = await getArtworkDetail(id);
    if (!detail) {
      return NextResponse.json(
        { success: false, error: { message: "Artwork not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: detail });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: { message: error instanceof Error ? error.message : "Failed to fetch artwork" },
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, reason, notes, message } = body;

    let result;

    switch (action) {
      case "flag":
        result = await flagForManualReview(id, reason ?? notes ?? "");
        break;
      case "approve":
        result = await approveArtwork(id, notes ?? "");
        break;
      case "under_review":
        result = await setUnderReview(id, notes ?? "");
        break;
      case "false_positive":
        result = await markFalsePositive(id, notes ?? "");
        break;
      case "hide":
        result = await hideArtwork(id);
        break;
      case "archive":
        result = await archiveArtwork(id);
        break;
      case "request_evidence":
        result = await requestMoreEvidence(id, message ?? notes ?? "");
        break;
      case "request_explanation":
        result = await requestArtistExplanation(id, message ?? notes ?? "");
        break;
      case "escalate":
        result = await escalateArtwork(id, notes ?? "");
        break;
      case "register_blockchain":
        result = await registerArtworkBlockchain(id);
        break;
      case "remove":
        result = await removeArtwork(id, reason ?? notes ?? "");
        break;
      default:
        return NextResponse.json(
          { success: false, error: { message: `Unknown action: ${action}` } },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: { message: error instanceof Error ? error.message : "Failed to perform action" },
      },
      { status: 500 }
    );
  }
}