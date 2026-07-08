/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ArtworkListItem,
  ArtworkDetail,
  ArtworkStats,
  ArtworksQueryParams,
  PaginatedArtworksResponse,
  ArtworkSortOption,
} from "../types";
import { SIMILARITY_THRESHOLD, MULTIPLE_MATCHES_THRESHOLD } from "../types";

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

function mapSortToQuery(
  sortBy: ArtworkSortOption
): { column: string; order: "asc" | "desc" } {
  switch (sortBy) {
    case "newest":
      return { column: "created_at", order: "desc" };
    case "oldest":
      return { column: "created_at", order: "asc" };
    case "alphabetical":
      return { column: "title", order: "asc" };
    case "highest_similarity":
      return { column: "best_similarity_percentage", order: "desc" };
    case "most_reported":
      return { column: "report_count", order: "desc" };
    case "most_upvoted":
      return { column: "upvote_count", order: "desc" };
    default:
      return { column: "created_at", order: "desc" };
  }
}

function computeNeedsReview(
  scan: { best_similarity_percentage: number | null; total_matches: number; success: boolean } | null,
  reportCount: number,
  artworkStatus: string,
  reviewStatus: string | null
): boolean {
  if (reviewStatus === "pending" || reviewStatus === "needs_info") return true;
  if ((scan?.best_similarity_percentage ?? 0) >= SIMILARITY_THRESHOLD) return true;
  if ((scan?.total_matches ?? 0) >= MULTIPLE_MATCHES_THRESHOLD) return true;
  if (reportCount > 0) return true;
  if (artworkStatus === "rejected") return true;
  return false;
}

function getReviewConditions(
  scan: { best_similarity_percentage: number | null; total_matches: number } | null,
  reportCount: number,
  artworkStatus: string,
  reviewStatus: string | null
): string[] {
  const conditions: string[] = [];
  if (reviewStatus === "pending") conditions.push("Awaiting manual review");
  if (reviewStatus === "needs_info") conditions.push("Additional evidence requested");
  if ((scan?.best_similarity_percentage ?? 0) >= SIMILARITY_THRESHOLD) {
    conditions.push(`High similarity (${scan!.best_similarity_percentage}%)`);
  }
  if ((scan?.total_matches ?? 0) >= MULTIPLE_MATCHES_THRESHOLD) {
    conditions.push(`Multiple similarity matches (${scan!.total_matches})`);
  }
  if (reportCount > 0) conditions.push(`${reportCount} active report(s)`);
  if (artworkStatus === "rejected") conditions.push("Blockchain verification failed");
  return conditions;
}

// ========== LIST ==========

export async function getArtworksList(
  params: ArtworksQueryParams
): Promise<PaginatedArtworksResponse> {
  const supabase = await createSupabaseServerClient();
  await verifyAdmin(supabase);

  // Build query for registered_arts with related data
  let query = supabase
    .from("registered_arts")
    .select(
      `
      id, title, description, c_secure_url, c_asset_id,
      file_hash, perceptual_hash, status, created_at, updated_at,
      owner:users!registered_arts_owner_id_fkey (
        id, username, first_name, last_name, c_profile_image
      )
    `,
      { count: "exact" }
    );

  // Apply search
  if (params.search) {
    query = query.or(
      `title.ilike.%${params.search}%,description.ilike.%${params.search}%,file_hash.ilike.%${params.search}%,perceptual_hash.ilike.%${params.search}%`
    );
    // Also search by owner username - we'll add a filter for that
  }

  // Apply status filter
  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  // Apply date filters
  if (params.date_from) {
    query = query.gte("created_at", params.date_from);
  }
  if (params.date_to) {
    query = query.lte("created_at", params.date_to);
  }

  // Apply owner filter
  if (params.owner) {
    query = query.or(
      `owner.username.ilike.%${params.owner}%,owner.first_name.ilike.%${params.owner}%,owner.last_name.ilike.%${params.owner}%`
    );
  }

  // Determine sort
  const { column: sortColumn, order } = mapSortToQuery(params.sort_by);
  const ascending = order === "asc";

  // For aggregated sorts, we'll sort in-memory after fetching
  if (
    sortColumn === "best_similarity_percentage" ||
    sortColumn === "report_count" ||
    sortColumn === "upvote_count"
  ) {
    query = query.order("created_at", { ascending: false });
  } else {
    query = query.order(sortColumn, { ascending });
  }

  // Pagination
  const from = (params.page - 1) * params.limit;
  const to = from + params.limit - 1;
  query = query.range(from, to);

  const { data: artworks, error, count } = await query;
  if (error) throw new Error(`Failed to fetch artworks: ${error.message}`);

  if (!artworks || artworks.length === 0) {
    return { items: [], total: 0, page: params.page, limit: params.limit, totalPages: 0 };
  }

  // Fetch additional data for each artwork
  const items = await Promise.all(
    artworks.map(async (art: any) => {
      const artworkId = art.id;

      // Fetch art_post
      const { data: post } = await supabase
        .from("art_posts")
        .select("id, visibility, is_archived, is_nsfw, upvote_count, downvote_count, score")
        .eq("art_id", artworkId)
        .maybeSingle();

      // Fetch similarity scan
      const { data: scan } = await supabase
        .from("art_similarity_scans")
        .select("id, status, best_similarity_percentage, total_matches, success")
        .eq("art_id", artworkId)
        .maybeSingle();

      // Fetch review
      const { data: review } = await supabase
        .from("artwork_reviews")
        .select("id, status")
        .eq("artwork_id", artworkId)
        .maybeSingle();

      // Fetch genres
      const { data: artGenres } = await supabase
        .from("art_genres")
        .select("genre_id")
        .eq("art_id", artworkId);
      let genres: Array<{ id: number; name: string }> = [];
      if (artGenres && artGenres.length > 0) {
        const genreIds = artGenres.map((g: any) => g.genre_id);
        const { data: genreNames } = await supabase
          .from("genres")
          .select("id, name")
          .in("id", genreIds);
        genres = (genreNames ?? []).map((g: any) => ({ id: g.id, name: g.name }));
      }

      // Count reports via art_posts
      let reportCount = 0;
      if (post) {
        const { count: rc } = await supabase
          .from("reports")
          .select("*", { count: "exact", head: true })
          .eq("reported_art_post_id", post.id);
        reportCount = rc ?? 0;
      }

      // Apply visibility filter
      if (params.visibility && params.visibility !== "all" && post) {
        if (post.visibility !== params.visibility) return null;
      }
      if (params.archived === "true" && (!post || !post.is_archived)) return null;
      if (params.archived === "false" && post?.is_archived) return null;

      // Apply has_reports filter
      if (params.has_reports === "true" && reportCount === 0) return null;
      if (params.has_reports === "false" && reportCount > 0) return null;

      // Apply has_similarity_scan filter
      if (params.has_similarity_scan === "true" && !scan) return null;
      if (params.has_similarity_scan === "false" && scan) return null;

      // Apply high_similarity filter
      if (params.high_similarity === "true" && (scan?.best_similarity_percentage ?? 0) < SIMILARITY_THRESHOLD) return null;
      if (params.high_similarity === "false" && (scan?.best_similarity_percentage ?? 0) >= SIMILARITY_THRESHOLD) return null;

      // Apply has_blockchain filter
      const hasBlockchain = !!(art.tx_hash && art.status === "active");
      if (params.has_blockchain === "true" && !hasBlockchain) return null;
      if (params.has_blockchain === "false" && hasBlockchain) return null;

      // Apply has_evidence filter
      const hasEvidence = !!(art.evidence_hash || art.evidence);
      if (params.has_evidence === "true" && !hasEvidence) return null;
      if (params.has_evidence === "false" && hasEvidence) return null;

      // Apply similarity_status filter
      if (params.similarity_status && params.similarity_status !== "all" && scan) {
        const sim = scan.best_similarity_percentage ?? 0;
        if (params.similarity_status === "high" && sim < 75) return null;
        if (params.similarity_status === "medium" && (sim < 50 || sim >= 75)) return null;
        if (params.similarity_status === "low" && sim >= 50) return null;
        if (params.similarity_status === "none" && scan) return null;
      }
      if (params.similarity_status === "none" && scan) return null;

      // Compute needs_review
      const needsReview = computeNeedsReview(scan, reportCount, art.status, review?.status ?? null);

      // Apply genre filter (after fetch)
      if (params.genre) {
        const hasGenre = genres.some(
          (g) => g.name.toLowerCase() === params.genre!.toLowerCase()
        );
        if (!hasGenre) return null;
      }

      // Apply search on owner username
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        const ownerMatch =
          art.owner?.username?.toLowerCase().includes(searchLower) ||
          art.owner?.first_name?.toLowerCase().includes(searchLower) ||
          art.owner?.last_name?.toLowerCase().includes(searchLower);
        if (!ownerMatch && !art.title.toLowerCase().includes(searchLower) && !(art.description?.toLowerCase().includes(searchLower) ?? false)) {
          // Already matched by the initial query, but we need to check owner too
          // Actually the initial query only checked title, description, hashes
          // So we need to also check owner fields
          const initialMatch =
            art.title?.toLowerCase().includes(searchLower) ||
            art.description?.toLowerCase().includes(searchLower) ||
            art.file_hash?.toLowerCase().includes(searchLower) ||
            art.perceptual_hash?.toLowerCase().includes(searchLower) ||
            art.id?.toLowerCase().includes(searchLower) ||
            (art.tx_hash?.toLowerCase().includes(searchLower) ?? false) ||
            (art.work_id?.toLowerCase().includes(searchLower) ?? false);
          if (!initialMatch && !ownerMatch) return null;
        }
      }

      return {
        id: art.id,
        title: art.title,
        description: art.description,
        c_secure_url: art.c_secure_url,
        c_asset_id: art.c_asset_id,
        file_hash: art.file_hash,
        perceptual_hash: art.perceptual_hash,
        status: art.status,
        created_at: art.created_at,
        updated_at: art.updated_at,
        owner: art.owner,
        art_post: post ?? null,
        scan: scan ?? null,
        review: review ?? null,
        genres,
        report_count: reportCount,
        needs_review: needsReview,
      } as ArtworkListItem;
    })
  );

  const filteredItems = items.filter((item): item is ArtworkListItem => item !== null);

  // Sort by aggregated fields
  if (sortColumn === "best_similarity_percentage") {
    filteredItems.sort((a, b) => {
      const simA = a.scan?.best_similarity_percentage ?? -1;
      const simB = b.scan?.best_similarity_percentage ?? -1;
      return ascending ? simA - simB : simB - simA;
    });
  } else if (sortColumn === "report_count") {
    filteredItems.sort((a, b) => {
      return ascending ? a.report_count - b.report_count : b.report_count - a.report_count;
    });
  } else if (sortColumn === "upvote_count") {
    filteredItems.sort((a, b) => {
      const upA = a.art_post?.upvote_count ?? 0;
      const upB = b.art_post?.upvote_count ?? 0;
      return ascending ? upA - upB : upB - upA;
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

// ========== DETAIL ==========

export async function getArtworkDetail(
  artworkId: string
): Promise<ArtworkDetail | null> {
  const supabase = await createSupabaseServerClient();
  await verifyAdmin(supabase);

  // Fetch artwork
  const { data: artwork, error } = await supabase
    .from("registered_arts")
    .select(
      `
      id, title, description, c_asset_id, c_secure_url,
      file_hash, perceptual_hash, author_id_hash, evidence_hash, evidence,
      chain, tx_hash, block_number, work_id, status, created_at, updated_at,
      owner:users!registered_arts_owner_id_fkey (
        id, username, first_name, last_name, email, c_profile_image, is_verified
      )
    `
    )
    .eq("id", artworkId)
    .single();

  if (error || !artwork) return null;
  const art = artwork as any;

  // Fetch art_post
  const { data: post } = await supabase
    .from("art_posts")
    .select("id, visibility, is_archived, is_nsfw, upvote_count, downvote_count, score, created_at")
    .eq("art_id", artworkId)
    .maybeSingle();

  // Fetch similarity scan
  const { data: scan } = await supabase
    .from("art_similarity_scans")
    .select("*")
    .eq("art_id", artworkId)
    .maybeSingle();

  // Fetch review with actions
  const { data: review } = await supabase
    .from("artwork_reviews")
    .select(
      `
      id, status, decision, decision_reason, review_notes,
      requested_documents, reviewer_id, assigned_at, reviewed_at,
      created_at, updated_at,
      reviewer:users!artwork_reviews_reviewer_id_fkey (
        id, first_name, last_name, username
      )
    `
    )
    .eq("artwork_id", artworkId)
    .maybeSingle();

  let reviewWithActions = null;
  if (review) {
    const { data: actions } = await supabase
      .from("artwork_review_actions")
      .select(
        `
        id, action, previous_status, new_status, notes, created_at,
        admin:users!artwork_review_actions_admin_id_fkey (
          id, first_name, last_name, username
        )
      `
      )
      .eq("review_id", (review as any).id)
      .order("created_at", { ascending: false });

    reviewWithActions = {
      ...(review as any),
      actions: actions ?? [],
    };
  }

  // Fetch genres
  const { data: artGenres } = await supabase
    .from("art_genres")
    .select("genre_id")
    .eq("art_id", artworkId);
  let genres: Array<{ id: number; name: string }> = [];
  if (artGenres && artGenres.length > 0) {
    const genreIds = artGenres.map((g: any) => g.genre_id);
    const { data: genreNames } = await supabase
      .from("genres")
      .select("id, name")
      .in("id", genreIds);
    genres = (genreNames ?? []).map((g: any) => ({ id: g.id, name: g.name }));
  }

  // Fetch reports
  let reports: Array<any> = [];
  if (post) {
    const { data: reportData } = await supabase
      .from("reports")
      .select(
        `
        id, title, report_type, status, created_at,
        reporter:users!reports_reporter_id_fkey (
          id, first_name, last_name, username, c_profile_image
        )
      `
      )
      .eq("reported_art_post_id", post.id)
      .order("created_at", { ascending: false });
    reports = (reportData ?? []) as any[];
  }

  // Fetch notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, title, message, is_read, created_at")
    .eq("related_art_id", artworkId)
    .order("created_at", { ascending: false })
    .limit(20);

  // Compute review conditions
  const reportCount = reports.length;
  const reviewStatus = (review as any)?.status ?? null;
  const conditions = getReviewConditions(
    scan as any,
    reportCount,
    art.status,
    reviewStatus
  );
  const needsReview = conditions.length > 0;

  return {
    id: art.id,
    title: art.title,
    description: art.description,
    c_asset_id: art.c_asset_id,
    c_secure_url: art.c_secure_url,
    file_hash: art.file_hash,
    perceptual_hash: art.perceptual_hash,
    author_id_hash: art.author_id_hash,
    evidence_hash: art.evidence_hash,
    evidence: art.evidence,
    chain: art.chain,
    tx_hash: art.tx_hash,
    block_number: art.block_number,
    work_id: art.work_id,
    status: art.status,
    created_at: art.created_at,
    updated_at: art.updated_at,
    owner: art.owner,
    art_post: post ?? null,
    scan: scan ?? null,
    review: reviewWithActions as any,
    genres,
    reports,
    notifications: (notifications ?? []) as any[],
    needs_review: needsReview,
    review_conditions: conditions,
  };
}

// ========== STATISTICS ==========

export async function getArtworkStats(): Promise<ArtworkStats> {
  const supabase = await createSupabaseServerClient();
  await verifyAdmin(supabase);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Total registered
  const { count: totalRegistered } = await supabase
    .from("registered_arts")
    .select("*", { count: "exact", head: true });

  // Pending blockchain
  const { count: pendingBlockchain } = await supabase
    .from("registered_arts")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending_blockchain");

  // Blockchain registered (active + has tx_hash)
  const { count: blockchainRegistered } = await supabase
    .from("registered_arts")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
    .not("tx_hash", "is", null);

  // Flagged for review
  const { count: flaggedForReview } = await supabase
    .from("artwork_reviews")
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "needs_info"]);

  // Public posts
  const { count: publicPosts } = await supabase
    .from("art_posts")
    .select("*", { count: "exact", head: true })
    .eq("visibility", "public")
    .eq("is_archived", false);

  // Archived posts
  const { count: archivedPosts } = await supabase
    .from("art_posts")
    .select("*", { count: "exact", head: true })
    .eq("is_archived", true);

  // Reported artworks (distinct art posts with reports)
  const { data: reportedArtData } = await supabase
    .from("reports")
    .select("reported_art_post_id");
  const uniqueReportedPosts = new Set(
    (reportedArtData ?? []).map((r: any) => r.reported_art_post_id)
  );

  // Similarity matches (scans with matches)
  const { count: similarityMatches } = await supabase
    .from("art_similarity_scans")
    .select("*", { count: "exact", head: true })
    .gt("total_matches", 0);

  // Today's uploads
  const { count: todaysUploads } = await supabase
    .from("registered_arts")
    .select("*", { count: "exact", head: true })
    .gte("created_at", todayStart.toISOString());

  // Highest similarity today
  const { data: highestSimData } = await supabase
    .from("art_similarity_scans")
    .select("best_similarity_percentage")
    .not("best_similarity_percentage", "is", null)
    .gte("created_at", todayStart.toISOString())
    .order("best_similarity_percentage", { ascending: false })
    .limit(1);
  const highestSimilarityToday =
    (highestSimData?.[0] as any)?.best_similarity_percentage ?? null;

  return {
    total_registered: totalRegistered ?? 0,
    pending_blockchain: pendingBlockchain ?? 0,
    blockchain_registered: blockchainRegistered ?? 0,
    flagged_for_review: flaggedForReview ?? 0,
    public_posts: publicPosts ?? 0,
    archived_posts: archivedPosts ?? 0,
    reported_artworks: uniqueReportedPosts.size,
    similarity_matches: similarityMatches ?? 0,
    todays_uploads: todaysUploads ?? 0,
    highest_similarity_today: highestSimilarityToday,
  };
}

// ========== RELATED QUERIES ==========

export async function getArtworkReports(
  artworkId: string,
  postId: string | null
): Promise<any[]> {
  if (!postId) return [];
  const supabase = await createSupabaseServerClient();
  await verifyAdmin(supabase);

  const { data } = await supabase
    .from("reports")
    .select(
      `
      id, title, report_type, status, description, created_at, resolved_at,
      reporter:users!reports_reporter_id_fkey (
        id, first_name, last_name, username, c_profile_image
      )
    `
    )
    .eq("reported_art_post_id", postId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getArtworkSimilarityScan(
  artworkId: string
): Promise<any> {
  const supabase = await createSupabaseServerClient();
  await verifyAdmin(supabase);

  const { data } = await supabase
    .from("art_similarity_scans")
    .select("*")
    .eq("art_id", artworkId)
    .maybeSingle();

  return data ?? null;
}

export async function getArtworkNotifications(
  artworkId: string
): Promise<any[]> {
  const supabase = await createSupabaseServerClient();
  await verifyAdmin(supabase);

  const { data } = await supabase
    .from("notifications")
    .select("id, type, title, message, is_read, created_at")
    .eq("related_art_id", artworkId)
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}