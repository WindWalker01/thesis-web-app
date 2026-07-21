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
 * Remove an artwork from public view (soft-delete).
 * 
 * Instead of hard-deleting the artwork (which would cause FK violations on the
 * reports table), this performs a soft-delete:
 * 1. Archives and hides the art post from public visibility
 * 2. Preserves the registered_arts record (blockchain evidence remains intact)
 * 3. Does NOT delete from registered_arts, avoiding FK cascade issues
 * 
 * The blockchain registration record is preserved as historical evidence,
 * which aligns with the thesis objective of maintaining immutable ownership proof.
 */
export async function removeArtworkFromReports(
  artworkId: string,
  reason: string
): Promise<ModerationActionResult> {
  try {
    const supabase = createSupabaseAdminClient();

    // Soft-delete: archive and hide the art post instead of deleting
    const { data: posts, error: postsError } = await supabase
      .from("art_posts")
      .select("id")
      .eq("art_id", artworkId);

    if (postsError) {
      return { success: false, message: `Failed to find artwork posts: ${postsError.message}` };
    }

    if (posts && posts.length > 0) {
      const postIds = posts.map((p: any) => p.id);

      // Archive and hide all posts for this artwork
      const { error: updateError } = await supabase
        .from("art_posts")
        .update({
          visibility: "private",
          is_archived: true,
        })
        .in("id", postIds);

      if (updateError) {
        return { success: false, message: `Failed to archive artwork: ${updateError.message}` };
      }
    }

    // Log the removal in admin_audit_logs
    await supabase.from("admin_audit_logs").insert({
      admin_id: "", // Will be set by caller if needed
      action: "remove_artwork",
      reason: reason,
      metadata: { artwork_id: artworkId },
    });

    return { success: true, message: "Artwork has been removed from public view. The blockchain registration record is preserved for evidence." };
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
 * Each step is individually checked and logged to prevent silent partial failures.
 */
export async function resolveReportAfterModeration(
  reportId: string,
  adminId: string,
  decisionValue: string,
  summary: string
): Promise<ModerationActionResult> {
  try {
    const supabase = createSupabaseAdminClient();

    // 1. Update report status
    const { error: updateError } = await supabase
      .from("reports")
      .update({
        status: "resolved",
        resolved_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    if (updateError) {
      console.error("[resolveReportAfterModeration] Failed to update report status:", updateError.message);
      return { success: false, message: `Failed to update report status: ${updateError.message}` };
    }

    // 2. Record decision
    const { error: decisionError } = await supabase.from("report_decisions").insert({
      report_id: reportId,
      admin_id: adminId,
      decision: decisionValue === "infringement_confirmed" ? "copyright_confirmed" : decisionValue,
      summary: summary,
    });

    if (decisionError) {
      console.error("[resolveReportAfterModeration] Failed to record decision:", decisionError.message);
      // Continue — report is already resolved, this is a secondary concern
    }

    // 3. Create audit action
    const { error: auditError } = await supabase.from("report_actions").insert({
      report_id: reportId,
      admin_id: adminId,
      action: "decision_recorded",
      previous_status: "under_review",
      new_status: "resolved",
      notes: `Moderation action resolved report. Decision: ${decisionValue}`,
    });

    if (auditError) {
      console.error("[resolveReportAfterModeration] Failed to create audit action:", auditError.message);
      // Continue — audit trail is important but not blocking
    }

    // 4. Notify reporter — handled by the database trigger notify_report_resolved()
    // No need to insert the notification here; the trigger fires after the UPDATE above.

    return { success: true, message: "Report resolved after moderation" };
  } catch (error) {
    console.error("[resolveReportAfterModeration] Unexpected error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to resolve report",
    };
  }
}