/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  ReviewQueueItem,
  ReviewDetail,
  ReviewStatistics,
  ReviewAction,
  ReviewActivityItem,
  ReviewStatus,
  ReviewActionType,
  PaginatedReviewsResponse,
  ReviewsQueryParams,
} from "../types";

// ========== HELPERS ==========

function mapSortToQuery(sortBy: string): { column: string; order: "asc" | "desc" } {
  switch (sortBy) {
    case "highest_similarity":
      return { column: "best_similarity_percentage", order: "desc" };
    case "oldest":
      return { column: "created_at", order: "asc" };
    case "newest":
      return { column: "created_at", order: "desc" };
    case "most_matches":
      return { column: "total_matches", order: "desc" };
    default:
      return { column: "created_at", order: "desc" };
  }
}


async function createAction(
  supabase: any,
  reviewId: string,
  adminId: string | undefined,
  action: ReviewActionType,
  previousStatus: string | null,
  newStatus: string | null,
  notes: string | null
): Promise<void> {
  if (!adminId) return;
  await supabase.from("artwork_review_actions").insert({
    review_id: reviewId,
    admin_id: adminId,
    action,
    previous_status: previousStatus,
    new_status: newStatus,
    notes,
  });
}

async function createAdminAuditLog(
  supabase: any,
  adminId: string | undefined,
  action: string,
  reason: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  if (!adminId) return;
  await supabase.from("admin_audit_logs").insert({
    admin_id: adminId,
    action,
    reason,
    metadata,
  });
}

// ========== QUEUE LIST ==========

export async function getReviewQueue(
  params: ReviewsQueryParams
): Promise<PaginatedReviewsResponse> {
  const supabase = createSupabaseAdminClient();

  // Mark as viewed by the admin
  // Build base query - get artwork_reviews with artwork and scan data
  let query = supabase
    .from("artwork_reviews")
    .select(
      `
      id,
      artwork_id,
      status,
      reviewer_id,
      assigned_at,
      created_at,
      reviewer:users!artwork_reviews_reviewer_id_fkey (
        id, first_name, last_name, username
      ),
      artwork:registered_arts!artwork_reviews_artwork_id_fkey (
        id, title, c_secure_url, file_hash, perceptual_hash,
        evidence_hash, description, status, created_at,
        owner:users!registered_arts_owner_id_fkey (
          id, username, first_name, last_name, c_profile_image
        )
      )
    `,
      { count: "exact" }
    );

  // Apply status filter
  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  // Apply artist filter
  if (params.artist) {
    query = query.or(
      `artwork.owner.username.ilike.%${params.artist}%,artwork.owner.first_name.ilike.%${params.artist}%,artwork.owner.last_name.ilike.%${params.artist}%`
    );
  }

  // Apply reviewer filter
  if (params.reviewer) {
    query = query.not("reviewer_id", "is", null);
    if (params.reviewer === "unassigned") {
      query = query.is("reviewer_id", null);
    }
  }

  // Apply search
  if (params.search) {
    query = query.or(
      `artwork.title.ilike.%${params.search}%,artwork.file_hash.ilike.%${params.search}%,artwork.perceptual_hash.ilike.%${params.search}%`
    );
  }

  // Apply date filter
  if (params.date && params.date !== "all") {
    const now = new Date();
    let dateFrom: Date;
    switch (params.date) {
      case "today":
        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        dateFrom = new Date(0);
    }
    query = query.gte("created_at", dateFrom.toISOString());
  }

  // Apply sorting
  const { column: sortColumn, order } = mapSortToQuery(params.sortBy);
  // For similarity sorting, we need to join with scans
  if (sortColumn === "best_similarity_percentage" || sortColumn === "total_matches") {
    query = query.order("created_at", { ascending: false });
  } else {
    const ascending = order === "asc";
    query = query.order(sortColumn, { ascending });
  }

  // Pagination
  const from = (params.page - 1) * params.limit;
  const to = from + params.limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw new Error(`Failed to fetch reviews: ${error.message}`);

  const items = (data ?? []) as unknown as ReviewQueueItem[];

  // Fetch scan data for each review
  const itemsWithScans = await Promise.all(
    items.map(async (item) => {
      const { data: scan } = await supabase
        .from("art_similarity_scans")
        .select(
          "id, best_similarity_percentage, best_source, best_link, best_url, total_matches, matches, hashes, completed_at"
        )
        .eq("art_id", item.artwork_id)
        .single();

      return {
        ...item,
        scan: scan ?? null,
      };
    })
  );

  // Sort by similarity if needed
  if (sortColumn === "best_similarity_percentage") {
    itemsWithScans.sort((a, b) => {
      const simA = a.scan?.best_similarity_percentage ?? -1;
      const simB = b.scan?.best_similarity_percentage ?? -1;
      return order === "desc" ? simB - simA : simA - simB;
    });
  } else if (sortColumn === "total_matches") {
    itemsWithScans.sort((a, b) => {
      const mA = a.scan?.total_matches ?? 0;
      const mB = b.scan?.total_matches ?? 0;
      return order === "desc" ? mB - mA : mA - mB;
    });
  }

  // Source filter (after fetching scans)
  let filteredItems = itemsWithScans;
  if (params.source && params.source !== "all") {
    filteredItems = itemsWithScans.filter((item) => {
      const source = item.scan?.best_source?.toLowerCase() ?? "";
      if (params.source === "internal") return source === "database";
      if (params.source === "external") return source === "internet" || source === "web";
      if (params.source === "none") return !source;
      return true;
    });
  }

  // Similarity filter
  if (params.similarity && params.similarity !== "all") {
    filteredItems = filteredItems.filter((item) => {
      const sim = item.scan?.best_similarity_percentage ?? 0;
      switch (params.similarity) {
        case "95+": return sim >= 95;
        case "90-95": return sim >= 90 && sim < 95;
        case "80-90": return sim >= 80 && sim < 90;
        default: return true;
      }
    });
  }

  return {
    items: filteredItems,
    total: count ?? 0,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil((count ?? 0) / params.limit),
  };
}

// ========== STATISTICS ==========

export async function getReviewStatistics(): Promise<ReviewStatistics> {
  const supabase = createSupabaseAdminClient();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Get all reviews with artwork ids
  const { data: reviews, error } = await supabase
    .from("artwork_reviews")
    .select("id, artwork_id, status, decision, reviewed_at, created_at, updated_at");

  if (error) throw new Error(`Failed to fetch review stats: ${error.message}`);

  const allReviews = (reviews ?? []) as Array<{
    id: string;
    artwork_id: string;
    status: string;
    decision: string | null;
    reviewed_at: string | null;
    created_at: string;
    updated_at: string;
  }>;

  const pending = allReviews.filter((r) => r.status === "pending").length;
  const underReview = allReviews.filter((r) => r.status === "under_review").length;
  const needsInfo = allReviews.filter((r) => r.status === "needs_info").length;
  const approvedToday = allReviews.filter(
    (r) => r.decision === "approved" && r.reviewed_at && new Date(r.reviewed_at) >= todayStart
  ).length;
  const rejectedToday = allReviews.filter(
    (r) => r.decision === "rejected" && r.reviewed_at && new Date(r.reviewed_at) >= todayStart
  ).length;

  // Average review time
  const decidedReviews = allReviews.filter(
    (r) => r.reviewed_at && (r.decision === "approved" || r.decision === "rejected")
  );
  let averageReviewTimeHours: number | null = null;
  if (decidedReviews.length > 0) {
    const totalHours = decidedReviews.reduce((sum, r) => {
      const created = new Date(r.created_at).getTime();
      const reviewed = new Date(r.reviewed_at!).getTime();
      return sum + (reviewed - created) / (1000 * 60 * 60);
    }, 0);
    averageReviewTimeHours = Math.round((totalHours / decidedReviews.length) * 100) / 100;
  }

  // High risk: pending reviews with high similarity scans
  const pendingReviews = allReviews.filter((r) => r.status === "pending");
  let highRisk = 0;
  for (const review of pendingReviews) {
    const { data: scan } = await supabase
      .from("art_similarity_scans")
      .select("best_similarity_percentage")
      .eq("art_id", review.artwork_id)
      .maybeSingle();

    const similarity = scan?.best_similarity_percentage ?? 0;
    if (similarity >= 90) highRisk++;
    else if (similarity >= 80) highRisk++;
    else if (similarity >= 70) highRisk++;
  }

  return {
    pending,
    under_review: underReview,
    needs_info: needsInfo,
    approved_today: approvedToday,
    rejected_today: rejectedToday,
    average_review_time_hours: averageReviewTimeHours,
    high_risk: highRisk,
  };
}

// ========== DETAIL ==========

export async function getReviewDetail(
  reviewId: string
): Promise<ReviewDetail | null> {
  const supabase = createSupabaseAdminClient();

  // Fetch review
  const { data: review, error } = await supabase
    .from("artwork_reviews")
    .select(
      `
      id, artwork_id, status, decision, decision_reason, review_notes,
      requested_documents, reviewer_id, assigned_at, reviewed_at,
      created_at, updated_at,
      reviewer:users!artwork_reviews_reviewer_id_fkey (
        id, first_name, last_name, username
      ),
      artwork:registered_arts!artwork_reviews_artwork_id_fkey (
        id, title, description, c_secure_url, c_asset_id,
        file_hash, perceptual_hash, evidence_hash, evidence,
        chain, tx_hash, block_number, work_id, status, created_at,
        owner:users!registered_arts_owner_id_fkey (
          id, username, first_name, last_name, email, c_profile_image
        )
      )
    `
    )
    .eq("id", reviewId)
    .single();

  if (error || !review) return null;

  const { data: { user } } = await supabase.auth.getUser();
  const adminId = user?.id;

  // Record view action
  if (adminId) {
    await createAction(
      supabase,
      reviewId,
      adminId,
      "viewed",
      review.status,
      review.status,
      null
    );
  }

  // Fetch scan
  const { data: scan } = await supabase
    .from("art_similarity_scans")
    .select("*")
    .eq("art_id", review.artwork_id)
    .single();

  // Fetch actions
  const { data: actions } = await supabase
    .from("artwork_review_actions")
    .select(
      `
      *,
      admin:users!artwork_review_actions_admin_id_fkey (
        id, first_name, last_name, username
      )
    `
    )
    .eq("review_id", reviewId)
    .order("created_at", { ascending: false });

  return {
    ...(review as any),
    scan: scan ?? null,
    actions: (actions ?? []) as unknown as ReviewAction[],
  } as ReviewDetail;
}

// ========== PENDING COUNT ==========

export async function getPendingReviewCount(): Promise<number> {
  const supabase = createSupabaseAdminClient();
  try {
    const { count, error } = await supabase
      .from("artwork_reviews")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

// ========== ASSIGN / UNASSIGN ==========

export async function assignReviewer(
  reviewId: string,
  newReviewerId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createSupabaseAdminClient();

    // If "self" placeholder, use the authenticated admin's ID
    const reviewerId = newReviewerId === "__self__"
      ? (await supabase.auth.getUser()).data.user?.id ?? newReviewerId
      : newReviewerId;

    const { data: { user } } = await supabase.auth.getUser();
    const adminUserId = user?.id;

    // Check review exists and is not already decided
    const { data: review } = await supabase
      .from("artwork_reviews")
      .select("status, reviewer_id")
      .eq("id", reviewId)
      .single();

    if (!review) return { success: false, message: "Review not found" };
    if (review.status === "approved" || review.status === "rejected") {
      return { success: false, message: "Cannot assign an already decided review" };
    }

    const previousStatus = review.status;

    // Update review
    await supabase
      .from("artwork_reviews")
      .update({
        reviewer_id: reviewerId,
        assigned_at: new Date().toISOString(),
        status: "under_review",
      })
      .eq("id", reviewId);

    // Audit log
    if (adminUserId) {
      await createAdminAuditLog(
        supabase,
        adminUserId,
        "assign_reviewer",
        `Assigned review ${reviewId}`
      );
    }

    return { success: true, message: "Reviewer assigned successfully" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to assign reviewer",
    };
  }
}

export async function unassignReviewer(
  reviewId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    const adminId = user?.id;

    const { data: review } = await supabase
      .from("artwork_reviews")
      .select("status, reviewer_id")
      .eq("id", reviewId)
      .single();

    if (!review) return { success: false, message: "Review not found" };

    const previousStatus = review.status;

    await supabase
      .from("artwork_reviews")
      .update({
        reviewer_id: null,
        assigned_at: null,
        status: "pending",
      })
      .eq("id", reviewId);

    if (adminId) {
      await createAction(
        supabase,
        reviewId,
        adminId,
        "unassigned",
        previousStatus,
        "pending",
        "Unassigned reviewer"
      );

      await createAdminAuditLog(supabase, adminId, "unassign_reviewer", `Unassigned review ${reviewId}`);
    }

    return { success: true, message: "Reviewer unassigned" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to unassign reviewer",
    };
  }
}

// ========== APPROVE ==========

export async function approveArtwork(
  reviewId: string,
  notes: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    const adminId = user?.id;

    const { data: review } = await supabase
      .from("artwork_reviews")
      .select("*, artwork:registered_arts!artwork_reviews_artwork_id_fkey(*)")
      .eq("id", reviewId)
      .single();

    if (!review) return { success: false, message: "Review not found" };
    if (review.status === "approved") return { success: false, message: "Already approved" };
    if (review.status === "rejected") return { success: false, message: "Already rejected" };

    const artwork = (review as any).artwork;
    if (!artwork) return { success: false, message: "Artwork not found" };

    // Check if already on blockchain
    if (artwork.tx_hash && artwork.status === "active") {
      return { success: false, message: "Artwork is already registered on blockchain" };
    }

    const previousStatus = review.status;

    // Update review
    const now = new Date().toISOString();
    await supabase
      .from("artwork_reviews")
      .update({
        status: "approved",
        decision: "approved",
        decision_reason: notes,
        review_notes: notes,
        reviewed_at: now,
      })
      .eq("id", reviewId);

    // Update artwork status to pending_blockchain so the existing flow picks it up
    await supabase
      .from("registered_arts")
      .update({ status: "pending_blockchain" })
      .eq("id", review.artwork_id);

    // Create action
    await createAction(
      supabase,
      reviewId,
      adminId,
      "approved",
      previousStatus,
      "approved",
      notes
    );

    // Create notification for artist
    await supabase.from("notifications").insert({
      user_id: artwork.owner_id,
      type: "review_approved",
      title: "Artwork Registration Approved",
      message: `Your artwork "${artwork.title}" has been approved after manual review. Registration will now proceed to the blockchain.`,
      related_art_id: review.artwork_id,
      action_url: `/profile/artworks/${review.artwork_id}`,
      metadata: { review_id: reviewId, admin_id: adminId },
    });

    // Audit log
    await createAdminAuditLog(supabase, adminId, "approve_artwork", `Approved artwork ${artwork.title}`, {
      review_id: reviewId,
      artwork_id: review.artwork_id,
    });

    // Trigger blockchain registration (fire and forget)
    try {
      const { recordArtworkOnBlockchain } = await import(
        "@/features/(user)/upload-artwork/server/record-artwork-blockchain"
      );
      recordArtworkOnBlockchain({
        artworkId: review.artwork_id,
        authorIdHash: artwork.author_id_hash ?? ("0x" + "0".repeat(64)),
        fileHash: artwork.file_hash,
        perceptualHash: artwork.perceptual_hash,
        evidenceHash: artwork.evidence_hash ?? ("0x" + "0".repeat(64)),
      }).then((result) => {
        if (result.success) {
          // Update review with blockchain trigger action
          supabase.from("artwork_review_actions").insert({
            review_id: reviewId,
            admin_id: adminId,
            action: "blockchain_triggered",
            previous_status: "approved",
            new_status: "blockchain_recorded",
            notes: `Blockchain registration completed. TX: ${result.txHash}`,
          });
          // Create notification
          supabase.from("notifications").insert({
            user_id: artwork.owner_id,
            type: "blockchain_recorded",
            title: "Artwork Registered on Blockchain",
            message: `Your artwork "${artwork.title}" has been successfully registered on the blockchain. Transaction: ${result.txHash}`,
            related_art_id: review.artwork_id,
            action_url: `/profile/artworks/${review.artwork_id}`,
            metadata: { tx_hash: result.txHash, work_id: result.workId },
          });
        }
      }).catch(() => {
        // Blockchain recording failed silently - artwork stays as pending_blockchain for retry
      });
    } catch {
      // Import failed, artwork will be picked up by the existing retry mechanism
    }

    return { success: true, message: "Artwork approved. Blockchain registration initiated." };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to approve artwork",
    };
  }
}

// ========== REJECT ==========

export async function rejectArtwork(
  reviewId: string,
  reason: string,
  notes: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    const adminId = user?.id;

    const { data: review } = await supabase
      .from("artwork_reviews")
      .select("*, artwork:registered_arts!artwork_reviews_artwork_id_fkey(*)")
      .eq("id", reviewId)
      .single();

    if (!review) return { success: false, message: "Review not found" };
    if (review.status === "approved") return { success: false, message: "Already approved" };
    if (review.status === "rejected") return { success: false, message: "Already rejected" };

    const artwork = (review as any).artwork;
    const previousStatus = review.status;
    const now = new Date().toISOString();

    // Update review
    await supabase
      .from("artwork_reviews")
      .update({
        status: "rejected",
        decision: "rejected",
        decision_reason: reason,
        review_notes: notes,
        reviewed_at: now,
      })
      .eq("id", reviewId);

    // Update artwork status
    await supabase
      .from("registered_arts")
      .update({ status: "rejected" })
      .eq("id", review.artwork_id);

    // Create action
    await createAction(
      supabase,
      reviewId,
      adminId,
      "rejected",
      previousStatus,
      "rejected",
      notes
    );

    // Notification
    await supabase.from("notifications").insert({
      user_id: artwork.owner_id,
      type: "review_rejected",
      title: "Artwork Registration Rejected",
      message: `Your artwork "${artwork.title}" has been rejected after manual review.\n\nReason: ${reason}`,
      related_art_id: review.artwork_id,
      action_url: `/profile/artworks/${review.artwork_id}`,
      metadata: { review_id: reviewId, admin_id: adminId, reason },
    });

    // Audit log
    await createAdminAuditLog(supabase, adminId, "reject_artwork", `Rejected artwork ${artwork.title}`, {
      review_id: reviewId,
      artwork_id: review.artwork_id,
      reason,
    });

    return { success: true, message: "Artwork rejected successfully" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to reject artwork",
    };
  }
}

// ========== REQUEST INFORMATION ==========

export async function requestInformation(
  reviewId: string,
  documents: string[],
  message: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    const adminId = user?.id;

    const { data: review } = await supabase
      .from("artwork_reviews")
      .select("*, artwork:registered_arts!artwork_reviews_artwork_id_fkey(*)")
      .eq("id", reviewId)
      .single();

    if (!review) return { success: false, message: "Review not found" };
    if (review.status === "approved" || review.status === "rejected") {
      return { success: false, message: "Cannot request info on a decided review" };
    }

    const artwork = (review as any).artwork;
    const previousStatus = review.status;

    // Update review
    await supabase
      .from("artwork_reviews")
      .update({
        status: "needs_info",
        requested_documents: documents,
        review_notes: message,
      })
      .eq("id", reviewId);

    // Create action
    await createAction(
      supabase,
      reviewId,
      adminId,
      "information_requested",
      previousStatus,
      "needs_info",
      message
    );

    // Notification
    const docList = documents.length > 0
      ? `\n\nPlease upload one or more of the following:\n${documents.map((d) => `• ${d}`).join("\n")}`
      : "";

    await supabase.from("notifications").insert({
      user_id: artwork.owner_id,
      type: "review_info_requested",
      title: "Additional Evidence Required",
      message: `Additional proof of ownership is required for "${artwork.title}".${docList}\n\nAdmin note: ${message}`,
      related_art_id: review.artwork_id,
      action_url: `/profile/artworks/${review.artwork_id}`,
      metadata: { review_id: reviewId, admin_id: adminId, documents },
    });

    // Audit log
    await createAdminAuditLog(supabase, adminId, "request_artwork_info", `Requested info for artwork ${artwork.title}`, {
      review_id: reviewId,
      artwork_id: review.artwork_id,
      documents,
    });

    return { success: true, message: "Information requested successfully" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to request information",
    };
  }
}

// ========== ADD REVIEW NOTE ==========

export async function addReviewNote(
  reviewId: string,
  notes: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createSupabaseAdminClient();

    await supabase
      .from("artwork_reviews")
      .update({ review_notes: notes })
      .eq("id", reviewId);

    return { success: true, message: "Notes saved" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to save notes",
    };
  }
}

// ========== ACTIVITY FEED ==========

export async function getReviewActivity(): Promise<ReviewActivityItem[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("artwork_review_actions")
    .select(
      `
      id,
      review_id,
      action,
      notes,
      created_at,
      admin:users!artwork_review_actions_admin_id_fkey (
        id, first_name, last_name, username
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(`Failed to fetch activity: ${error.message}`);

  const items = (data ?? []) as any[];

  // Fetch artwork titles for each action
  const itemsWithTitles = await Promise.all(
    items.map(async (item) => {
      const { data: review } = await supabase
        .from("artwork_reviews")
        .select("artwork:registered_arts!artwork_reviews_artwork_id_fkey(title)")
        .eq("id", item.review_id)
        .single();

      return {
        id: item.id,
        review_id: item.review_id,
        admin: item.admin,
        action: item.action,
        notes: item.notes,
        created_at: item.created_at,
        artwork_title: (review as any)?.artwork?.title ?? "Unknown Artwork",
      } as ReviewActivityItem;
    })
  );

  return itemsWithTitles;
}

// ========== BULK OPERATIONS ==========

export async function bulkApprove(
  reviewIds: string[],
  notes: string
): Promise<{ success: boolean; message: string }> {
  try {
    const results = await Promise.allSettled(
      reviewIds.map((id) => approveArtwork(id, notes))
    );
    const succeeded = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;
    return {
      success: succeeded > 0,
      message: `${succeeded} of ${reviewIds.length} approved`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Bulk approve failed",
    };
  }
}

export async function bulkReject(
  reviewIds: string[],
  reason: string,
  notes: string
): Promise<{ success: boolean; message: string }> {
  try {
    const results = await Promise.allSettled(
      reviewIds.map((id) => rejectArtwork(id, reason, notes))
    );
    const succeeded = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;
    return {
      success: succeeded > 0,
      message: `${succeeded} of ${reviewIds.length} rejected`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Bulk reject failed",
    };
  }
}

export async function bulkAssign(
  reviewIds: string[],
  adminId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const results = await Promise.allSettled(
      reviewIds.map((id) => assignReviewer(id, adminId))
    );
    const succeeded = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;
    return {
      success: succeeded > 0,
      message: `${succeeded} of ${reviewIds.length} assigned`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Bulk assign failed",
    };
  }
}

// ========== GET ADMINS FOR ASSIGNMENT ==========

export async function getAdminUsers(): Promise<
  Array<{ id: string; first_name: string; last_name: string; username: string }>
> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("users")
    .select("id, first_name, last_name, username")
    .eq("role", "admin")
    .order("first_name", { ascending: true });

  if (error) throw new Error("Failed to fetch admins");
  return data ?? [];
}