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
        // Get or ensure a review exists for this artwork
        const reviewResult = await ensureReviewForArtwork(artworkId);
        if (!reviewResult.success || !reviewResult.reviewId) {
          return NextResponse.json(
            { success: false, error: { message: reviewResult.message } },
            { status: 500 }
          );
        }

        result = await approveArtworkFromReview(
          artworkId,
          reviewResult.reviewId,
          notes ?? "Approved via report moderation"
        );

        if (result.success) {
          // Resolve the report as infringement confirmed
          await resolveReportAfterModeration(
            reportId,
            adminId,
            "infringement_confirmed",
            reason ?? "Artwork was reviewed and approved during report investigation."
          );
        }
        break;
      }

      case "reject_artwork": {
        const reviewResult = await ensureReviewForArtwork(artworkId);
        if (!reviewResult.success || !reviewResult.reviewId) {
          return NextResponse.json(
            { success: false, error: { message: reviewResult.message } },
            { status: 500 }
          );
        }

        result = await rejectArtworkFromReview(
          artworkId,
          reviewResult.reviewId,
          reason ?? "Rejected via report moderation",
          notes ?? ""
        );

        if (result.success) {
          await resolveReportAfterModeration(
            reportId,
            adminId,
            "infringement_confirmed",
            reason ?? "Artwork was rejected during report investigation."
          );
        }
        break;
      }

      case "remove_artwork": {
        result = await removeArtworkFromReports(
          artworkId,
          reason ?? "Removed via report moderation"
        );

        if (result.success) {
          await resolveReportAfterModeration(
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