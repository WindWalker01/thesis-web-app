// ============================================
// Reporting & Complaint Management - Repository
// Data access layer for report-related tables
// ============================================

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Report,
  ReportComment,
  ReportEvidence,
  ReportAction,
  ReportDecision,
  AdminReportListItem,
  AdminReportDetail,
  ReportStatistics,
  ReportStatus,
  ReportActionType,
  MatchedArtworkRef,
} from "@/features/shared/reports/types";

// ========== REPORTS (main table) ==========

export async function insertReport(
  supabase: SupabaseClient,
  data: {
    reporter_id: string;
    reported_art_post_id: string;
    report_type: string;
    title: string;
    description: string;
  }
): Promise<Report> {
  const { data: report, error } = await supabase
    .from("reports")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(`Failed to create report: ${error.message}`);
  return report as Report;
}

export async function getReportById(
  supabase: SupabaseClient,
  reportId: string
): Promise<Report | null> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", reportId)
    .single();

  if (error) return null;
  return data as Report;
}

export async function getUserReports(
  supabase: SupabaseClient,
  userId: string
): Promise<Report[]> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("reporter_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch user reports: ${error.message}`);
  return (data ?? []) as Report[];
}

export async function getUserReportById(
  supabase: SupabaseClient,
  userId: string,
  reportId: string
): Promise<Report | null> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", reportId)
    .eq("reporter_id", userId)
    .single();

  if (error) return null;
  return data as Report;
}

export async function updateReportStatus(
  supabase: SupabaseClient,
  reportId: string,
  status: ReportStatus,
  resolvedAt?: string | null
): Promise<void> {
  const updates: Record<string, unknown> = { status };
  if (resolvedAt !== undefined) {
    updates.resolved_at = resolvedAt;
  }

  const { error } = await supabase
    .from("reports")
    .update(updates)
    .eq("id", reportId);

  if (error) throw new Error(`Failed to update report status: ${error.message}`);
}

export async function assignAdminToReport(
  supabase: SupabaseClient,
  reportId: string,
  adminId: string
): Promise<void> {
  const { error } = await supabase
    .from("reports")
    .update({
      assigned_admin_id: adminId,
      status: "under_review" as ReportStatus,
    })
    .eq("id", reportId);

  if (error) throw new Error(`Failed to assign admin: ${error.message}`);
}

export async function getReportAssignedAdmin(
  supabase: SupabaseClient,
  reportId: string
): Promise<{ id: string; first_name: string; last_name: string; username: string } | null> {
  const { data: report } = await supabase
    .from("reports")
    .select("assigned_admin_id")
    .eq("id", reportId)
    .single();

  if (!report?.assigned_admin_id) return null;

  const { data: admin } = await supabase
    .from("users")
    .select("id, first_name, last_name, username")
    .eq("id", report.assigned_admin_id)
    .single();

  return admin as { id: string; first_name: string; last_name: string; username: string } | null;
}

// ========== REPORT COMMENTS ==========

export async function insertReportComment(
  supabase: SupabaseClient,
  data: {
    report_id: string;
    user_id: string;
    message: string;
    is_admin: boolean;
  }
): Promise<ReportComment> {
  const { data: comment, error } = await supabase
    .from("report_comments")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(`Failed to add comment: ${error.message}`);
  return comment as ReportComment;
}

export async function getReportComments(
  supabase: SupabaseClient,
  reportId: string
): Promise<ReportComment[]> {
  const { data, error } = await supabase
    .from("report_comments")
    .select("*")
    .eq("report_id", reportId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch comments: ${error.message}`);
  return (data ?? []) as ReportComment[];
}

export async function getReportCommentCount(
  supabase: SupabaseClient,
  reportId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("report_comments")
    .select("*", { count: "exact", head: true })
    .eq("report_id", reportId);

  if (error) throw new Error(`Failed to count comments: ${error.message}`);
  return count ?? 0;
}

// ========== REPORT EVIDENCE ==========

export async function insertReportEvidence(
  supabase: SupabaseClient,
  data: {
    report_id: string;
    uploaded_by: string;
    file_url: string;
    file_name: string;
    mime_type: string | null;
    description: string | null;
  }
): Promise<ReportEvidence> {
  const { data: evidence, error } = await supabase
    .from("report_evidence")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(`Failed to add evidence: ${error.message}`);
  return evidence as ReportEvidence;
}

export async function getReportEvidence(
  supabase: SupabaseClient,
  reportId: string
): Promise<ReportEvidence[]> {
  const { data, error } = await supabase
    .from("report_evidence")
    .select("*")
    .eq("report_id", reportId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch evidence: ${error.message}`);
  return (data ?? []) as ReportEvidence[];
}

export async function getReportEvidenceCount(
  supabase: SupabaseClient,
  reportId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("report_evidence")
    .select("*", { count: "exact", head: true })
    .eq("report_id", reportId);

  if (error) throw new Error(`Failed to count evidence: ${error.message}`);
  return count ?? 0;
}

// ========== REPORT ACTIONS (Audit Trail) ==========

export async function insertReportAction(
  supabase: SupabaseClient,
  data: {
    report_id: string;
    admin_id: string;
    action: ReportActionType;
    previous_status: ReportStatus | null;
    new_status: ReportStatus | null;
    notes: string | null;
  }
): Promise<ReportAction> {
  const { data: action, error } = await supabase
    .from("report_actions")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(`Failed to record action: ${error.message}`);
  return action as ReportAction;
}

export async function getReportActions(
  supabase: SupabaseClient,
  reportId: string
): Promise<ReportAction[]> {
  const { data, error } = await supabase
    .from("report_actions")
    .select("*")
    .eq("report_id", reportId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch actions: ${error.message}`);
  return (data ?? []) as ReportAction[];
}

// ========== REPORT DECISIONS ==========

export async function insertReportDecision(
  supabase: SupabaseClient,
  data: {
    report_id: string;
    admin_id: string;
    decision: string;
    summary: string;
  }
): Promise<ReportDecision> {
  const { data: decision, error } = await supabase
    .from("report_decisions")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(`Failed to record decision: ${error.message}`);
  return decision as ReportDecision;
}

export async function getReportDecision(
  supabase: SupabaseClient,
  reportId: string
): Promise<ReportDecision | null> {
  const { data, error } = await supabase
    .from("report_decisions")
    .select("*")
    .eq("report_id", reportId)
    .single();

  if (error) return null;
  return data as ReportDecision;
}

// ========== ADMIN QUERIES ==========

/** Minimal report shape needed to resolve the linked registered artwork. */
type ReportArtworkLinkInput = {
  id: string;
  reported_art_post_id: string | null;
  target_type?: string | null;
  target_id?: string | null;
  reported_art_post?: {
    id: string;
    registered_arts?: { id: string } | { id: string }[] | null;
  } | null;
};

/**
 * PostgREST returns an embedded to-one resource as an object, but an array when
 * the relationship cardinality is ambiguous. Normalise both shapes.
 */
function extractEmbeddedArtworkId(
  artPost: ReportArtworkLinkInput["reported_art_post"]
): string | null {
  const embedded = artPost?.registered_arts;
  if (!embedded) return null;
  if (Array.isArray(embedded)) return embedded[0]?.id ?? null;
  return embedded.id ?? null;
}

/**
 * Resolves the registered artwork each report is about, keyed by report id.
 *
 * A report can point at its artwork in three ways, tried in order:
 *  1. the `art_posts -> registered_arts` embed already present on the row;
 *  2. `target_type='artwork'` + `target_id` (plagiarism reports, including
 *     matches whose artwork has no public community post);
 *  3. `reported_art_post_id` resolved through `art_posts.art_id` (reports
 *     created before the `target_id` link existed).
 *
 * Every report therefore resolves through a single batched artwork query, so
 * admin list/detail views never depend on per-row joins and always expose the
 * artwork id needed for moderation actions.
 *
 * `supabase` should be a service-role client: `registered_arts` has no admin
 * SELECT policy, so a user-scoped client would silently return no rows.
 */
export async function resolveMatchedArtworksForReports<
  T extends ReportArtworkLinkInput,
>(
  supabase: SupabaseClient,
  reports: T[]
): Promise<Map<string, MatchedArtworkRef>> {
  const artworkIdByReport = new Map<string, string>();
  const unresolvedPostIds = new Set<string>();

  for (const report of reports) {
    const embeddedId = extractEmbeddedArtworkId(report.reported_art_post);
    if (embeddedId) {
      artworkIdByReport.set(report.id, embeddedId);
      continue;
    }
    if (report.target_type === "artwork" && report.target_id) {
      artworkIdByReport.set(report.id, report.target_id);
      continue;
    }
    if (report.reported_art_post_id) unresolvedPostIds.add(report.reported_art_post_id);
  }

  // Reports linked only by art post: resolve the post's artwork in one batch.
  if (unresolvedPostIds.size > 0) {
    // Graceful degradation: a failed lookup must never break the report list.
    const { data } = await supabase
      .from("art_posts")
      .select("id, art_id")
      .in("id", Array.from(unresolvedPostIds));

    const artIdByPost = new Map(
      (data ?? []).map((post) => [post.id as string, post.art_id as string | null])
    );
    for (const report of reports) {
      if (!report.reported_art_post_id || artworkIdByReport.has(report.id)) continue;
      const artId = artIdByPost.get(report.reported_art_post_id);
      if (artId) artworkIdByReport.set(report.id, artId);
    }
  }

  const artworkIds = new Set(artworkIdByReport.values());
  const byArtworkId = new Map<string, MatchedArtworkRef>();
  if (artworkIds.size > 0) {
    const { data, error } = await supabase
      .from("registered_arts")
      .select("id, title, c_secure_url, status")
      .in("id", Array.from(artworkIds));

    if (!error) {
      for (const row of (data ?? []) as Array<{
        id: string;
        title: string;
        c_secure_url: string | null;
        status: string;
      }>) {
        byArtworkId.set(row.id, {
          id: row.id,
          title: row.title,
          c_secure_url: row.c_secure_url,
          status: row.status,
        });
      }
    }
  }

  const map = new Map<string, MatchedArtworkRef>();
  for (const [reportId, artworkId] of artworkIdByReport) {
    const ref = byArtworkId.get(artworkId);
    if (ref) map.set(reportId, ref);
  }
  return map;
}

export async function getAdminReportsList(params: {
  page: number;
  limit: number;
  status?: string;
  reportType?: string;
  search?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}): Promise<{ items: AdminReportListItem[]; total: number }> {
  const supabase = await createSupabaseServerClient();

  // Verify admin access
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") throw new Error("Not authorized");

  // Admin reads run on the service-role client: `registered_arts` has no admin
  // SELECT policy (only owner / public-post policies), so a user-scoped client
  // silently returns no artwork rows and every report renders as
  // "Unknown Artwork" with no moderation actions available.
  const adminSupabase = createSupabaseAdminClient();

  // Build query
  let query = adminSupabase
    .from("reports")
    .select(
      `
      id,
      title,
      report_type,
      status,
      created_at,
      resolved_at,
      target_type,
      target_id,
      related_scan_id,
      reporter:users!reports_reporter_id_fkey (
        id,
        first_name,
        last_name,
        middle_name,
        username,
        c_profile_image
      ),
      reported_art_post:art_posts!reports_reported_art_post_id_fkey (
        id,
        registered_arts:registered_arts!art_posts_art_id_fkey (
          id,
          title,
          c_secure_url
        )
      )
    `,
      { count: "exact" }
    );

  // Apply filters
  if (params.status) {
    query = query.eq("status", params.status);
  }
  if (params.reportType) {
    query = query.eq("report_type", params.reportType);
  }
  if (params.search) {
    query = query.or(
      `title.ilike.%${params.search}%,description.ilike.%${params.search}%`
    );
  }

  // Apply sorting
  query = query.order(params.sortBy as "created_at" | "status" | "report_type" | "title", {
    ascending: params.sortOrder === "asc",
  });

  // Apply pagination
  const from = (params.page - 1) * params.limit;
  const to = from + params.limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw new Error(`Failed to fetch reports: ${error.message}`);

  const items = (data ?? []) as unknown as AdminReportListItem[];

  // Resolve the registered artwork each report is about (embed, target_id, or
  // the reported art post's art_id) in a single batched lookup.
  const matchedArtworks = await resolveMatchedArtworksForReports(
    adminSupabase,
    (data ?? []) as unknown as Parameters<
      typeof resolveMatchedArtworksForReports
    >[1]
  );

  // Fetch evidence and comment counts for each report
  const itemsWithCounts = await Promise.all(
    items.map(async (item) => {
      const [evidenceCount, commentCount] = await Promise.all([
        getReportEvidenceCount(adminSupabase, item.id),
        getReportCommentCount(adminSupabase, item.id),
      ]);

      const decision = await getReportDecision(adminSupabase, item.id);

      return {
        ...item,
        matched_artwork: matchedArtworks.get(item.id) ?? null,
        evidence_count: evidenceCount,
        comment_count: commentCount,
        has_decision: decision !== null,
      };
    })
  );

  return { items: itemsWithCounts, total: count ?? 0 };
}

export async function getAdminReportDetail(
  reportId: string
): Promise<AdminReportDetail | null> {
  const supabase = await createSupabaseServerClient();

  // Verify admin access
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") throw new Error("Not authorized");

  // Service-role client for every data read (see getAdminReportsList for why).
  const adminSupabase = createSupabaseAdminClient();

  // Fetch report
  const report = await getReportById(adminSupabase, reportId);
  if (!report) return null;

  // Fetch reporter
  const { data: reporter } = await adminSupabase
    .from("users")
    .select("id, first_name, last_name, middle_name, username, email, c_profile_image, created_at")
    .eq("id", report.reporter_id)
    .single();

  // Fetch reported art post (nullable for plagiarism reports keyed by target_id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let artPost: any = null;
  if (report.reported_art_post_id) {
    const { data } = await adminSupabase
      .from("art_posts")
      .select(
        `
      id,
      art_id,
      registered_arts:registered_arts!art_posts_art_id_fkey (
        id,
        title,
        description,
        c_secure_url,
        file_hash,
        status,
        created_at,
        owner_id
      )
    `
      )
      .eq("id", report.reported_art_post_id)
      .maybeSingle();
    artPost = data;
  }

  // Resolve the registered artwork this report is about, however it is linked
  // (art post embed -> target_id -> art post's art_id). Moderation actions need
  // this id for reports whose artwork has no public community post, and the
  // drawer needs the artwork record for every other report.
  const artworkId =
    extractEmbeddedArtworkId(artPost) ??
    (report.target_type === "artwork" ? report.target_id : null) ??
    artPost?.art_id ??
    null;

  let matchedArtwork: AdminReportDetail["matched_artwork"] = null;
  if (artworkId) {
    const { data } = await adminSupabase
      .from("registered_arts")
      .select(
        "id, title, description, c_secure_url, file_hash, status, created_at, owner_id"
      )
      .eq("id", artworkId)
      .maybeSingle();
    matchedArtwork = (data as AdminReportDetail["matched_artwork"]) ?? null;
  }

  // Fetch evidence, comments, decision, actions in parallel
  const [evidence, comments, decision, actions] = await Promise.all([
    getReportEvidence(adminSupabase, reportId),
    getReportComments(adminSupabase, reportId),
    getReportDecision(adminSupabase, reportId),
    getReportActions(adminSupabase, reportId),
  ]);

  // Fetch moderation summary for user and artwork context
  const artworkOwnerId = matchedArtwork?.owner_id ?? null;
  const moderationSummary = await getModerationSummary(
    adminSupabase,
    report.reported_art_post_id,
    artworkOwnerId,
    artworkId
  );

  // Fetch actions with admin names (join users)
  const actionsWithNames = await getReportActionsWithAdminNames(
    adminSupabase,
    reportId
  );

  return {
    report,
    reporter: reporter as AdminReportDetail["reporter"],
    reported_art_post: (artPost as AdminReportDetail["reported_art_post"]) ?? null,
    matched_artwork: (matchedArtwork as AdminReportDetail["matched_artwork"]) ?? null,
    evidence,
    comments,
    decision,
    actions: actionsWithNames.length > 0 ? actionsWithNames : actions,
    moderationSummary,
  };
}

// ========== MODERATION SUMMARY ==========

export async function getModerationSummary(
  supabase: SupabaseClient,
  reportedArtPostId: string | null,
  artworkOwnerId: string | null,
  targetArtworkId?: string | null
): Promise<import("@/features/shared/reports/types").ModerationSummary> {
  // Fetch user stats and artwork stats in parallel
  const [userStats, artworkStats] = await Promise.all([
    artworkOwnerId
      ? getModerationUserStats(supabase, artworkOwnerId)
      : Promise.resolve({ warnings: 0, suspensions: 0, bans: 0, previousReports: 0, resolvedReports: 0 }),
    getModerationArtworkStats(supabase, reportedArtPostId, targetArtworkId ?? null),
  ]);

  return {
    user: userStats,
    artwork: artworkStats,
  };
}

async function getModerationUserStats(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  warnings: number;
  suspensions: number;
  bans: number;
  previousReports: number;
  resolvedReports: number;
}> {
  const [warningsRes, suspensionsRes, bansRes, reportsRes] = await Promise.all([
    supabase.from("user_warnings").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("admin_audit_logs").select("*", { count: "exact", head: true }).eq("target_user_id", userId).eq("action", "suspend_user"),
    supabase.from("admin_audit_logs").select("*", { count: "exact", head: true }).eq("target_user_id", userId).eq("action", "ban_user"),
    supabase.rpc("get_user_report_counts", { p_user_id: userId }),
  ]);

  // Fallback for reports count if RPC doesn't exist
  let previousReports = 0;
  let resolvedReports = 0;
  if (reportsRes.error) {
    // Manual query fallback
    const { data: userArtworks } = await supabase
      .from("registered_arts")
      .select("id")
      .eq("owner_id", userId);

    if (userArtworks && userArtworks.length > 0) {
      const artIds = userArtworks.map((a) => a.id);
      const { data: artPosts } = await supabase
        .from("art_posts")
        .select("id")
        .in("art_id", artIds);

      if (artPosts && artPosts.length > 0) {
        const postIds = artPosts.map((p) => p.id);
        const { count: totalCount } = await supabase
          .from("reports")
          .select("*", { count: "exact", head: true })
          .in("reported_art_post_id", postIds);
        const { count: resolvedCount } = await supabase
          .from("reports")
          .select("*", { count: "exact", head: true })
          .in("reported_art_post_id", postIds)
          .eq("status", "resolved");

        previousReports = totalCount ?? 0;
        resolvedReports = resolvedCount ?? 0;
      }
    }
  } else if (reportsRes.data && typeof reportsRes.data === "object") {
    const data = reportsRes.data as Record<string, number>;
    previousReports = data.total ?? 0;
    resolvedReports = data.resolved ?? 0;
  }

  return {
    warnings: warningsRes.count ?? 0,
    suspensions: suspensionsRes.count ?? 0,
    bans: bansRes.count ?? 0,
    previousReports,
    resolvedReports,
  };
}

async function getModerationArtworkStats(
  supabase: SupabaseClient,
  artPostId: string | null,
  targetArtworkId?: string | null
): Promise<{
  previousReports: number;
  copyrightReports: number;
  wasRemoved: boolean;
}> {
  if (!artPostId && !targetArtworkId) {
    return { previousReports: 0, copyrightReports: 0, wasRemoved: false };
  }

  // Plagiarism reports link the artwork via target_type='artwork' + target_id.
  if (!artPostId && targetArtworkId) {
    const [allRes, copyrightRes, artworkRes] = await Promise.all([
      supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("target_type", "artwork")
        .eq("target_id", targetArtworkId),
      supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("target_type", "artwork")
        .eq("target_id", targetArtworkId)
        .eq("report_type", "copyright"),
      // These matches often have no community post, so the artwork's own
      // lifecycle status is the only signal that it was removed.
      supabase
        .from("registered_arts")
        .select("status")
        .eq("id", targetArtworkId)
        .maybeSingle(),
    ]);

    return {
      previousReports: allRes.count ?? 0,
      copyrightReports: copyrightRes.count ?? 0,
      wasRemoved: artworkRes.data?.status === "removed",
    };
  }

  const [allRes, copyrightRes, removedRes] = await Promise.all([
    supabase.from("reports").select("*", { count: "exact", head: true }).eq("reported_art_post_id", artPostId),
    supabase.from("reports").select("*", { count: "exact", head: true }).eq("reported_art_post_id", artPostId).eq("report_type", "copyright"),
    supabase.from("report_actions")
      .select("*", { count: "exact", head: true })
      .eq("action", "artwork_removed")
      .in("report_id", (await supabase.from("reports").select("id").eq("reported_art_post_id", artPostId)).data?.map((r: { id: string }) => r.id) ?? []),
  ]);

  // Simpler fallback for wasRemoved: check art_posts is_archived
  const { data: artPost } = await supabase
    .from("art_posts")
    .select("is_archived")
    .eq("id", artPostId)
    .single();

  return {
    previousReports: allRes.count ?? 0,
    copyrightReports: copyrightRes.count ?? 0,
    wasRemoved: artPost?.is_archived ?? false,
  };
}

// ========== REPORT ACTIONS WITH ADMIN NAMES ==========

export async function getReportActionsWithAdminNames(
  supabase: SupabaseClient,
  reportId: string
): Promise<import("@/features/shared/reports/types").ReportAction[]> {
  const { data, error } = await supabase
    .from("report_actions")
    .select(`
      id,
      report_id,
      admin_id,
      action,
      previous_status,
      new_status,
      notes,
      created_at,
      admin:users!report_actions_admin_id_fkey (
        first_name,
        last_name
      )
    `)
    .eq("report_id", reportId)
    .order("created_at", { ascending: false });

  if (error) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map((row: any) => {
    const admin = row.admin;
    const adminName = admin
      ? `${admin.first_name} ${admin.last_name ?? ""}`.trim()
      : undefined;

    return {
      id: row.id,
      report_id: row.report_id,
      admin_id: row.admin_id,
      action: row.action as import("@/features/shared/reports/types").ReportActionType,
      previous_status: row.previous_status as import("@/features/shared/reports/types").ReportStatus | null,
      new_status: row.new_status as import("@/features/shared/reports/types").ReportStatus | null,
      notes: row.notes,
      created_at: row.created_at,
      admin_name: adminName,
    };
  });
}

// ========== STATISTICS ==========

export async function getReportStatistics(): Promise<ReportStatistics> {
  const supabase = await createSupabaseServerClient();

  // Get all reports with status counts
  const { data: stats, error } = await supabase.rpc("get_report_statistics");

  if (error) {
    // Fallback: compute stats manually
    const { data: reports, error: fetchError } = await supabase
      .from("reports")
      .select("id, status, report_type, created_at, resolved_at");

    if (fetchError) throw new Error(`Failed to fetch statistics: ${fetchError.message}`);

    const allReports = (reports ?? []) as Array<{
      id: string;
      status: string;
      report_type: string;
      created_at: string;
      resolved_at: string | null;
    }>;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const total = allReports.length;
    const pendingReview = allReports.filter((r) => r.status === "pending_review").length;
    const underReview = allReports.filter((r) => r.status === "under_review").length;
    const resolved = allReports.filter((r) => r.status === "resolved").length;
    const reportsThisMonth = allReports.filter(
      (r) => new Date(r.created_at) >= monthStart
    ).length;

    // Average resolution time
    const resolvedReports = allReports.filter(
      (r) => r.status === "resolved" && r.resolved_at
    );
    let averageResolutionTimeHours: number | null = null;
    if (resolvedReports.length > 0) {
      const totalHours = resolvedReports.reduce((sum, r) => {
        const created = new Date(r.created_at).getTime();
        const resolved = new Date(r.resolved_at!).getTime();
        return sum + (resolved - created) / (1000 * 60 * 60);
      }, 0);
      averageResolutionTimeHours = Math.round((totalHours / resolvedReports.length) * 100) / 100;
    }

    // Reports by type
    const typeMap = new Map<string, number>();
    for (const report of allReports) {
      typeMap.set(
        report.report_type,
        (typeMap.get(report.report_type) ?? 0) + 1
      );
    }
    const reportsByType = Array.from(typeMap.entries()).map(([type, count]) => ({
      type: type as ReportStatistics["reports_by_type"][number]["type"],
      count,
    }));

    return {
      total,
      pending_review: pendingReview,
      under_review: underReview,
      resolved,
      average_resolution_time_hours: averageResolutionTimeHours,
      reports_this_month: reportsThisMonth,
      reports_by_type: reportsByType,
    };
  }

  return stats as ReportStatistics;
}