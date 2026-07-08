/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminActionResult } from "../types";

// ========== HELPERS ==========

async function verifyAdmin(supabase: SupabaseClient): Promise<string> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") throw new Error("Not authorized");

  return user.id;
}

async function createAdminAuditLog(
  supabase: SupabaseClient,
  adminId: string,
  action: string,
  reason: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  await supabase.from("admin_audit_logs").insert({
    admin_id: adminId,
    action,
    reason,
    metadata,
  });
}

// ========== MANUAL REVIEW FLAG ==========

export async function flagForManualReview(
  artworkId: string,
  reason: string
): Promise<AdminActionResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const adminId = await verifyAdmin(supabase);

    // Check if review already exists
    const { data: existing } = await supabase
      .from("artwork_reviews")
      .select("id, status")
      .eq("artwork_id", artworkId)
      .maybeSingle();

    if (existing) {
      if (existing.status === "pending" || existing.status === "needs_info") {
        return { success: false, message: "Artwork is already flagged for review" };
      }
      // Update existing review
      await supabase
        .from("artwork_reviews")
        .update({ status: "pending", review_notes: reason })
        .eq("id", existing.id);
    } else {
      // Create new review
      await supabase.from("artwork_reviews").insert({
        artwork_id: artworkId,
        status: "pending",
        review_notes: reason,
      });
    }

    // Update artwork status
    await supabase
      .from("registered_arts")
      .update({ status: "flagged" })
      .eq("id", artworkId);

    await createAdminAuditLog(supabase, adminId, "flag_artwork", reason, {
      artwork_id: artworkId,
    });

    return { success: true, message: "Artwork flagged for manual review" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to flag artwork",
    };
  }
}

// ========== APPROVE ==========

export async function approveArtwork(
  artworkId: string,
  notes: string
): Promise<AdminActionResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const adminId = await verifyAdmin(supabase);

    // Update or create review
    const { data: existing } = await supabase
      .from("artwork_reviews")
      .select("id, status")
      .eq("artwork_id", artworkId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("artwork_reviews")
        .update({
          status: "approved",
          decision: "approved",
          decision_reason: notes,
          review_notes: notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    }

    // Update artwork status
    await supabase
      .from("registered_arts")
      .update({ status: "pending_blockchain" })
      .eq("id", artworkId);

    await createAdminAuditLog(supabase, adminId, "approve_artwork", notes, {
      artwork_id: artworkId,
    });

    return { success: true, message: "Artwork approved" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to approve artwork",
    };
  }
}

// ========== SET UNDER REVIEW ==========

export async function setUnderReview(
  artworkId: string,
  notes: string
): Promise<AdminActionResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const adminId = await verifyAdmin(supabase);

    const { data: existing } = await supabase
      .from("artwork_reviews")
      .select("id")
      .eq("artwork_id", artworkId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("artwork_reviews")
        .update({ status: "under_review", review_notes: notes })
        .eq("id", existing.id);
    } else {
      await supabase.from("artwork_reviews").insert({
        artwork_id: artworkId,
        status: "under_review",
        review_notes: notes,
      });
    }

    await supabase
      .from("registered_arts")
      .update({ status: "flagged" })
      .eq("id", artworkId);

    await createAdminAuditLog(supabase, adminId, "review_artwork", notes, {
      artwork_id: artworkId,
    });

    return { success: true, message: "Artwork placed under review" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update review status",
    };
  }
}

// ========== MARK FALSE POSITIVE ==========

export async function markFalsePositive(
  artworkId: string,
  notes: string
): Promise<AdminActionResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const adminId = await verifyAdmin(supabase);

    const { data: existing } = await supabase
      .from("artwork_reviews")
      .select("id")
      .eq("artwork_id", artworkId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("artwork_reviews")
        .update({
          status: "approved",
          decision: "approved",
          decision_reason: `False positive: ${notes}`,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    }

    await supabase
      .from("registered_arts")
      .update({ status: "pending_blockchain" })
      .eq("id", artworkId);

    await createAdminAuditLog(supabase, adminId, "false_positive_artwork", notes, {
      artwork_id: artworkId,
    });

    return { success: true, message: "Marked as false positive" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to mark as false positive",
    };
  }
}

// ========== HIDE ARTWORK ==========

export async function hideArtwork(
  artworkId: string
): Promise<AdminActionResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const adminId = await verifyAdmin(supabase);

    const { data: post } = await supabase
      .from("art_posts")
      .select("id")
      .eq("art_id", artworkId)
      .maybeSingle();

    if (post) {
      await supabase
        .from("art_posts")
        .update({ visibility: "private" })
        .eq("id", post.id);
    }

    await createAdminAuditLog(supabase, adminId, "hide_artwork", "Artwork hidden by admin", {
      artwork_id: artworkId,
    });

    return { success: true, message: "Artwork hidden from public view" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to hide artwork",
    };
  }
}

// ========== ARCHIVE ARTWORK ==========

export async function archiveArtwork(
  artworkId: string
): Promise<AdminActionResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const adminId = await verifyAdmin(supabase);

    const { data: post } = await supabase
      .from("art_posts")
      .select("id")
      .eq("art_id", artworkId)
      .maybeSingle();

    if (post) {
      await supabase
        .from("art_posts")
        .update({ is_archived: true })
        .eq("id", post.id);
    }

    await createAdminAuditLog(supabase, adminId, "archive_artwork", "Artwork archived by admin", {
      artwork_id: artworkId,
    });

    return { success: true, message: "Artwork archived" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to archive artwork",
    };
  }
}

// ========== REQUEST MORE EVIDENCE ==========

export async function requestMoreEvidence(
  artworkId: string,
  message: string
): Promise<AdminActionResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const adminId = await verifyAdmin(supabase);

    const { data: existing } = await supabase
      .from("artwork_reviews")
      .select("id")
      .eq("artwork_id", artworkId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("artwork_reviews")
        .update({ status: "needs_info", review_notes: message })
        .eq("id", existing.id);
    } else {
      await supabase.from("artwork_reviews").insert({
        artwork_id: artworkId,
        status: "needs_info",
        review_notes: message,
      });
    }

    await supabase
      .from("registered_arts")
      .update({ status: "flagged" })
      .eq("id", artworkId);

    // Notify artist
    const { data: art } = await supabase
      .from("registered_arts")
      .select("title, owner_id")
      .eq("id", artworkId)
      .single();

    if (art) {
      await supabase.from("notifications").insert({
        user_id: (art as any).owner_id,
        type: "review_info_requested",
        title: "Additional Evidence Required",
        message: `Additional evidence is required for "${(art as any).title}". Admin note: ${message}`,
        related_art_id: artworkId,
        action_url: `/profile/artworks/${artworkId}`,
        metadata: { admin_id: adminId },
      });
    }

    await createAdminAuditLog(supabase, adminId, "request_evidence", message, {
      artwork_id: artworkId,
    });

    return { success: true, message: "Evidence requested from artist" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to request evidence",
    };
  }
}

// ========== REQUEST ARTIST EXPLANATION ==========

export async function requestArtistExplanation(
  artworkId: string,
  message: string
): Promise<AdminActionResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const adminId = await verifyAdmin(supabase);

    const { data: art } = await supabase
      .from("registered_arts")
      .select("title, owner_id")
      .eq("id", artworkId)
      .single();

    if (art) {
      await supabase.from("notifications").insert({
        user_id: (art as any).owner_id,
        type: "review_info_requested",
        title: "Artist Explanation Requested",
        message: `An explanation is requested for "${(art as any).title}". Admin message: ${message}`,
        related_art_id: artworkId,
        action_url: `/profile/artworks/${artworkId}`,
        metadata: { admin_id: adminId },
      });
    }

    await createAdminAuditLog(supabase, adminId, "request_explanation", message, {
      artwork_id: artworkId,
    });

    return { success: true, message: "Explanation requested from artist" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to request explanation",
    };
  }
}

// ========== ESCALATE ==========

export async function escalateArtwork(
  artworkId: string,
  notes: string
): Promise<AdminActionResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const adminId = await verifyAdmin(supabase);

    const { data: existing } = await supabase
      .from("artwork_reviews")
      .select("id, status")
      .eq("artwork_id", artworkId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("artwork_reviews")
        .update({ status: "needs_info", review_notes: notes })
        .eq("id", existing.id);
    } else {
      await supabase.from("artwork_reviews").insert({
        artwork_id: artworkId,
        status: "needs_info",
        review_notes: notes,
      });
    }

    await createAdminAuditLog(supabase, adminId, "escalate_artwork", notes, {
      artwork_id: artworkId,
    });

    return { success: true, message: "Artwork escalated" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to escalate artwork",
    };
  }
}

// ========== REMOVE ARTWORK ==========

export async function removeArtwork(
  artworkId: string,
  reason: string
): Promise<AdminActionResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const adminId = await verifyAdmin(supabase);

    // Delete the artwork (cascade will handle posts, scans, reviews, genres)
    await supabase.from("registered_arts").delete().eq("id", artworkId);

    await createAdminAuditLog(supabase, adminId, "remove_artwork", reason, {
      artwork_id: artworkId,
    });

    return { success: true, message: "Artwork removed successfully" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to remove artwork",
    };
  }
}

// ========== BULK ACTIONS ==========

export async function bulkArchive(
  artworkIds: string[]
): Promise<AdminActionResult> {
  try {
    const supabase = await createSupabaseServerClient();
    await verifyAdmin(supabase);

    await supabase
      .from("art_posts")
      .update({ is_archived: true })
      .in(
        "art_id",
        artworkIds
      );

    return { success: true, message: `${artworkIds.length} artworks archived` };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Bulk archive failed",
    };
  }
}

export async function bulkHide(
  artworkIds: string[]
): Promise<AdminActionResult> {
  try {
    const supabase = await createSupabaseServerClient();
    await verifyAdmin(supabase);

    await supabase
      .from("art_posts")
      .update({ visibility: "private" })
      .in(
        "art_id",
        artworkIds
      );

    return { success: true, message: `${artworkIds.length} artworks hidden` };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Bulk hide failed",
    };
  }
}

export async function bulkDelete(
  artworkIds: string[]
): Promise<AdminActionResult> {
  try {
    const supabase = await createSupabaseServerClient();
    await verifyAdmin(supabase);

    await supabase
      .from("registered_arts")
      .delete()
      .in("id", artworkIds);

    return { success: true, message: `${artworkIds.length} artworks deleted` };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Bulk delete failed",
    };
  }
}

export async function bulkApprove(
  artworkIds: string[]
): Promise<AdminActionResult> {
  try {
    const results = await Promise.allSettled(
      artworkIds.map((id) => {
        const supabasePromise = createSupabaseServerClient();
        return supabasePromise.then((supabase) =>
          supabase
            .from("registered_arts")
            .update({ status: "pending_blockchain" })
            .eq("id", id)
        );
      })
    );
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    return { success: true, message: `${succeeded} of ${artworkIds.length} approved` };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Bulk approve failed",
    };
  }
}

export async function bulkMarkReview(
  artworkIds: string[]
): Promise<AdminActionResult> {
  try {
    const supabase = await createSupabaseServerClient();
    await verifyAdmin(supabase);

    for (const artworkId of artworkIds) {
      const { data: existing } = await supabase
        .from("artwork_reviews")
        .select("id")
        .eq("artwork_id", artworkId)
        .maybeSingle();

      if (!existing) {
        await supabase.from("artwork_reviews").insert({
          artwork_id: artworkId,
          status: "pending",
        });
      }
      await supabase
        .from("registered_arts")
        .update({ status: "flagged" })
        .eq("id", artworkId);
    }

    return { success: true, message: `${artworkIds.length} artworks flagged for review` };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Bulk mark review failed",
    };
  }
}