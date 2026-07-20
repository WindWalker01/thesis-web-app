import { NextRequest, NextResponse } from "next/server";
import {
  approveArtworkFromReview,
  rejectArtworkFromReview,
  removeArtworkFromReports,
  requestArtworkInformation,
  ensureReviewForArtwork,
  resolveReportAfterModeration,
  getReviewForArtwork,
} from "@/features/admin/shared/moderation-service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/server-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const reportId = (await params).id;
    const body = await request.json();
    const { action, reason, notes, artworkId } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: { message: "Action is required" } },
        { status: 400 }
      );
    }

    // Get the current admin user using cookie-based auth (server client)
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "Authentication required" } },
        { status: 401 }
      );
    }
    const adminId = user.id;

    // Use admin client for service-role DB operations (bypasses RLS)
    const supabase = createSupabaseAdminClient();

    let result;

    switch (action) {
      case "approve_artwork": {
        // Check if artwork is already blockchain-registered
        const { data: artwork } = await supabase
          .from("registered_arts")
          .select("tx_hash, status")
          .eq("id", artworkId)
          .single();

        if (artwork?.tx_hash && artwork?.status === "active") {
          // Artwork already registered on blockchain — skip review, resolve report directly
          result = await resolveReportAfterModeration(
            reportId,
            adminId,
            "no_violation",
            reason ?? "Report dismissed — no infringement found after investigation."
          );
        } else {
          // Normal flow: ensure review exists, then approve artwork
          const reviewResult = await ensureReviewForArtwork(artworkId);
          if (!reviewResult.success || !reviewResult.reviewId) {
            return NextResponse.json(
              { success: false, error: { message: reviewResult.message } },
              { status: 500 }
            );
          }

          const approveResult = await approveArtworkFromReview(
            artworkId,
            reviewResult.reviewId,
            notes ?? "Approved via report moderation"
          );

          if (approveResult.success) {
            result = await resolveReportAfterModeration(
              reportId,
              adminId,
              "no_violation",
              reason ?? "Artwork was reviewed and cleared during report investigation."
            );
          } else {
            result = approveResult;
          }
        }
        break;
      }

      case "reject_artwork": {
        // Check if artwork is already blockchain-registered
        const { data: artworkForReject } = await supabase
          .from("registered_arts")
          .select("tx_hash, status")
          .eq("id", artworkId)
          .single();

        if (artworkForReject?.tx_hash && artworkForReject?.status === "active") {
          // Artwork already registered — skip review, resolve report directly
          result = await resolveReportAfterModeration(
            reportId,
            adminId,
            "infringement_confirmed",
            reason ?? "Report upheld — infringement confirmed after investigation."
          );
        } else {
          // Normal flow: ensure review exists, then reject artwork
          const reviewResult = await ensureReviewForArtwork(artworkId);
          if (!reviewResult.success || !reviewResult.reviewId) {
            return NextResponse.json(
              { success: false, error: { message: reviewResult.message } },
              { status: 500 }
            );
          }

          const rejectResult = await rejectArtworkFromReview(
            artworkId,
            reviewResult.reviewId,
            reason ?? "Rejected via report moderation",
            notes ?? ""
          );

          if (rejectResult.success) {
            result = await resolveReportAfterModeration(
              reportId,
              adminId,
              "infringement_confirmed",
              reason ?? "Artwork was flagged during report investigation."
            );
          } else {
            result = rejectResult;
          }
        }
        break;
      }

      case "remove_artwork": {
        result = await removeArtworkFromReports(
          artworkId,
          reason ?? "Removed via report moderation"
        );

        if (result.success) {
          result = await resolveReportAfterModeration(
            reportId,
            adminId,
            "infringement_confirmed",
            reason ?? "Artwork was removed during report investigation."
          );
        }
        break;
      }

      case "request_more_info": {
        // Get the existing review for this artwork
        const existingReviewId = await getReviewForArtwork(artworkId);
        if (!existingReviewId) {
          return NextResponse.json(
            { success: false, error: { message: "No review found for this artwork. Please start a review first." } },
            { status: 400 }
          );
        }

        result = await requestArtworkInformation(
          artworkId,
          existingReviewId,
          body.documents ?? [],
          notes ?? ""
        );

        if (result.success) {
          // The artwork review is already set to "needs_info" by requestArtworkInformation().
          // Keep the report at "under_review" and record the information request in the audit log.
          await supabase.from("report_actions").insert({
            report_id: reportId,
            admin_id: adminId,
            action: "evidence_requested",
            previous_status: "under_review",
            new_status: "under_review",
            notes: `Information requested from artist for artwork moderation. ${notes ?? ""}`,
          });
        }
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: { message: `Unknown action: ${action}` } },
          { status: 400 }
        );
    }

    // Normalize response: convert { success: false, message } to { success: false, error: { message } }
    // because the frontend (ReportDrawer) expects result.error?.message
    if (result && !result.success && "message" in result) {
      return NextResponse.json(
        { success: false, error: { message: result.message } },
        { status: 500 }
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: { message: error instanceof Error ? error.message : "Failed to moderate artwork" },
      },
      { status: 500 }
    );
  }
}