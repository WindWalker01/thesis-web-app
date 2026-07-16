/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Shared Moderation Service
 * 
 * Provides a unified interface for artwork moderation actions that can be
 * used by both the Artwork Verification page and the Reports page.
 * 
 * Reuses existing server actions from artwork-verification and artwork-management
 * to avoid duplicating business logic.
 */

type ModerationActionResult = {
  success: boolean;
  message: string;
  reviewId?: string;
};

/**
 * Approve an artwork from a review context.
 * Calls the same approveArtwork from the reviews module.
 */
export async function approveArtworkFromReview(
  artworkId: string,
  reviewId: string,
  notes: string
): Promise<ModerationActionResult> {
  try {
    // Dynamically import to avoid circular dependencies
    const { approveArtwork } = await import(
      "@/features/admin/artwork-verification/server/reviews"
    );
    return await approveArtwork(reviewId, notes);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to approve artwork",
    };
  }
}

/**
 * Reject an artwork from a review context.
 * Calls the same rejectArtwork from the reviews module.
 */
export async function rejectArtworkFromReview(
  artworkId: string,
  reviewId: string,
  reason: string,
  notes: string
): Promise<ModerationActionResult> {
  try {
    const { rejectArtwork } = await import(
      "@/features/admin/artwork-verification/server/reviews"
    );
    return await rejectArtwork(reviewId, reason, notes);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to reject artwork",
    };
  }
}

/**
 * Request more information for an artwork review.
 * Calls the same requestInformation from the reviews module.
 */
export async function requestArtworkInformation(
  artworkId: string,
  reviewId: string,
  documents: string[],
  message: string
): Promise<ModerationActionResult> {
  try {
    const { requestInformation } = await import(
      "@/features/admin/artwork-verification/server/reviews"
    );
    return await requestInformation(reviewId, documents, message);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to request information",
    };
  }
}

/**
 * Remove an artwork entirely.
 * Calls the removeArtwork from admin-actions module.
 * Also resolves associated reports.
 */
export async function removeArtworkFromReports(
  artworkId: string,
  reason: string
): Promise<ModerationActionResult> {
  try {
    const { removeArtwork } = await import(
      "@/features/admin/artwork-management/server/admin-actions"
    );
    const result = await removeArtwork(artworkId, reason);

    if (result.success) {
      // Resolve all open reports for this artwork
      const supabase = createSupabaseAdminClient();
      const { data: posts } = await supabase
        .from("art_posts")
        .select("id")
        .eq("art_id", artworkId);

      if (posts && posts.length > 0) {
        const postIds = posts.map((p: any) => p.id);
        const { data: openReports } = await supabase
          .from("reports")
          .select("id")
          .in("reported_art_post_id", postIds)
          .in("status", ["pending_review", "under_review"]);

        if (openReports && openReports.length > 0) {
          await supabase
            .from("reports")
            .update({
              status: "resolved",
              resolved_at: new Date().toISOString(),
            })
            .in("id", openReports.map((r: any) => r.id));
        }
      }
    }

    return result;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to remove artwork",
    };
  }
}

/**
 * Hide an artwork from public view.
 * Calls the hideArtwork from admin-actions module.
 */
export async function hideArtworkFromReports(
  artworkId: string
): Promise<ModerationActionResult> {
  try {
    const { hideArtwork } = await import(
      "@/features/admin/artwork-management/server/admin-actions"
    );
    return await hideArtwork(artworkId);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to hide artwork",
    };
  }
}

/**
 * Get or create a review for an artwork.
 * Used when a report is being moderated and no review exists yet.
 */
export async function ensureReviewForArtwork(
  artworkId: string
): Promise<{ reviewId: string | null; success: boolean; message: string }> {
  try {
    const supabase = createSupabaseAdminClient();

    // Check if review already exists
    const { data: existing } = await supabase
      .from("artwork_reviews")
      .select("id")
      .eq("artwork_id", artworkId)
      .maybeSingle();

    if (existing) {
      return { reviewId: existing.id, success: true, message: "Review exists" };
    }

    // Create a new review
    const { data: newReview } = await supabase
      .from("artwork_reviews")
      .insert({
        artwork_id: artworkId,
        status: "pending",
      })
      .select("id")
      .single();

    if (!newReview) {
      return { reviewId: null, success: false, message: "Failed to create review" };
    }

    return { reviewId: newReview.id, success: true, message: "Review created" };
  } catch (error) {
    return {
      reviewId: null,
      success: false,
      message: error instanceof Error ? error.message : "Failed to ensure review",
    };
  }
}

/**
 * Get the review ID for an artwork, if one exists.
 */
export async function getReviewForArtwork(
  artworkId: string
): Promise<string | null> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("artwork_reviews")
      .select("id")
      .eq("artwork_id", artworkId)
      .maybeSingle();
    return data?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Resolve a report after a moderation action.
 * Updates the report status and creates a decision record.
 */
export async function resolveReportAfterModeration(
  reportId: string,
  adminId: string,
  decisionValue: string,
  summary: string
): Promise<ModerationActionResult> {
  try {
    const supabase = createSupabaseAdminClient();

    // Update report status
    await supabase
      .from("reports")
      .update({
        status: "resolved",
        resolved_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    // Record decision
    await supabase.from("report_decisions").insert({
      report_id: reportId,
      admin_id: adminId,
      decision: decisionValue,
      summary: summary,
    });

    // Create audit action
    await supabase.from("report_actions").insert({
      report_id: reportId,
      admin_id: adminId,
      action: "decision_recorded",
      previous_status: "under_review",
      new_status: "resolved",
      notes: `Moderation action resolved report. Decision: ${decisionValue}`,
    });

    // Notify reporter
    const { data: report } = await supabase
      .from("reports")
      .select("reporter_id, title")
      .eq("id", reportId)
      .single();

    if (report) {
      await supabase.from("notifications").insert({
        user_id: (report as any).reporter_id,
        type: "report_resolved",
        title: "Report Resolved",
        message: `Your report "${(report as any).title}" has been resolved after moderation action was taken.`,
        related_report_id: reportId,
        action_url: `/my-reports/${reportId}`,
        metadata: {},
      });
    }

    return { success: true, message: "Report resolved after moderation" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to resolve report",
    };
  }
}