"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  UserDetail,
  UserArtwork,
  UserReport,
  UserBlockchainActivity,
  TimelineEvent,
} from "../types";

type DetailResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

export async function fetchUserDetail(
  userId: string
): Promise<DetailResult<UserDetail>> {
  try {
    const supabase = await createSupabaseServerClient();

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Not authenticated." };

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || profile.role !== "admin") {
      return { success: false, message: "Unauthorized." };
    }

    // Fetch user profile
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      return { success: false, message: userError?.message ?? "User not found." };
    }

    // Fetch stats in parallel
    const [
      artworksResult,
      postsResult,
      upvotesResult,
      reportsFiledResult,
      reportsAgainstResult,
      scansResult,
      blockchainResult,
      notificationsResult,
      walletResult,
    ] = await Promise.all([
      supabase
        .from("registered_arts")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", userId),
      supabase
        .from("art_posts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("visibility", "public")
        .eq("is_archived", false),
      supabase
        .from("art_posts")
        .select("upvote_count")
        .eq("user_id", userId),
      supabase
        .from("reports")
        .select("id", { count: "exact", head: true })
        .eq("reporter_id", userId),
      // Reports against user's artworks
      supabase
        .from("reports")
        .select(
          `
          id,
          reported_art_post:art_posts!reports_reported_art_post_id_fkey (
            art_id,
            registered_arts:registered_arts!art_posts_art_id_fkey (
              owner_id
            )
          )
        `
        )
        .filter("reported_art_post.registered_arts.owner_id", "eq", userId),
      supabase
        .from("art_similarity_scans")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", userId)
        .eq("success", true)
        .gt("total_matches", 0),
      supabase
        .from("registered_arts")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", userId)
        .not("tx_hash", "is", null),
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      // Get latest wallet address from user's blockchain-registered artworks
      supabase
        .from("registered_arts")
        .select("tx_hash, chain")
        .eq("owner_id", userId)
        .not("tx_hash", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    // Calculate upvotes total
    const totalUpvotes = (upvotesResult.data ?? []).reduce(
      (sum: number, post: { upvote_count: number }) =>
        sum + (post.upvote_count ?? 0),
      0
    );

    // Reports against (count distinct report IDs)
    const reportsAgainstData = reportsAgainstResult.data ?? [];
    const reportsAgainstSet = new Set(
      reportsAgainstData.map(
        (r: { id: string }) => r.id
      )
    );

    const walletAddress = walletResult.data?.tx_hash ?? null;

    return {
      success: true,
      data: {
        id: userData.id,
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        middle_name: userData.middle_name,
        email: userData.email,
        bio: userData.bio,
        c_profile_image: userData.c_profile_image,
        role: userData.role,
        account_status: userData.account_status ?? "active",
        is_verified: userData.is_verified,
        country: userData.country,
        suspended_until: userData.suspended_until,
        suspension_reason: userData.suspension_reason,
        last_active: userData.last_active,
        is_online: userData.is_online,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        wallet_address: walletAddress,
        statistics: {
          registered_artworks: artworksResult.count ?? 0,
          public_posts: postsResult.count ?? 0,
          total_upvotes_received: totalUpvotes,
          reports_filed: reportsFiledResult.count ?? 0,
          reports_against: reportsAgainstSet.size,
          similarity_matches: scansResult.count ?? 0,
          blockchain_registrations: blockchainResult.count ?? 0,
          notifications_count: notificationsResult.count ?? 0,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch user details.",
    };
  }
}

export async function fetchUserArtworks(
  userId: string
): Promise<DetailResult<UserArtwork[]>> {
  try {
    const supabase = await createSupabaseServerClient();

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Not authenticated." };

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || profile.role !== "admin") {
      return { success: false, message: "Unauthorized." };
    }

    const { data, error } = await supabase
      .from("registered_arts")
      .select(
        `
        id, title, c_secure_url, status, created_at, tx_hash, work_id
      `
      )
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return { success: false, message: error.message };
    }

    // Fetch similarity scores and post visibility for each artwork
    const artworkIds = (data ?? []).map((a: { id: string }) => a.id);

    const [similarityScans, artPosts] = await Promise.all([
      supabase
        .from("art_similarity_scans")
        .select("art_id, best_similarity_percentage")
        .in("art_id", artworkIds)
        .eq("success", true),
      supabase
        .from("art_posts")
        .select("art_id, visibility")
        .in("art_id", artworkIds),
    ]);

    const scanMap = new Map(
      (similarityScans.data ?? []).map(
        (s: { art_id: string; best_similarity_percentage: number | null }) => [
          s.art_id,
          s.best_similarity_percentage,
        ]
      )
    );

    const postMap = new Map(
      (artPosts.data ?? []).map(
        (p: { art_id: string; visibility: string }) => [p.art_id, p.visibility]
      )
    );

    const artworks: UserArtwork[] = (data ?? []).map(
      (a: {
        id: string;
        title: string;
        c_secure_url: string | null;
        status: string;
        created_at: string;
        tx_hash: string | null;
        work_id: string | null;
      }) => ({
        id: a.id,
        title: a.title,
        c_secure_url: a.c_secure_url,
        visibility: postMap.get(a.id) ?? "private",
        similarity_score: scanMap.get(a.id) ?? null,
        created_at: a.created_at,
        status: a.status,
        tx_hash: a.tx_hash,
        work_id: a.work_id,
      })
    );

    return { success: true, data: artworks };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch artworks.",
    };
  }
}

export async function fetchUserReports(
  userId: string
): Promise<DetailResult<UserReport[]>> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Not authenticated." };

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || profile.role !== "admin") {
      return { success: false, message: "Unauthorized." };
    }

    // Reports filed by user
    const { data: filedReports, error: filedError } = await supabase
      .from("reports")
      .select(
        `
        id, report_type, title, status, created_at
      `
      )
      .eq("reporter_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (filedError) {
      return { success: false, message: filedError.message };
    }

    // Fetch decisions for these reports
    const reportIds = (filedReports ?? []).map((r: { id: string }) => r.id);

    const { data: decisions } = await supabase
      .from("report_decisions")
      .select("report_id, decision")
      .in("report_id", reportIds);

    const decisionMap = new Map(
      (decisions ?? []).map(
        (d: { report_id: string; decision: string }) => [
          d.report_id,
          d.decision,
        ]
      )
    );

    const reports: UserReport[] = (filedReports ?? []).map(
      (r: {
        id: string;
        report_type: string;
        title: string;
        status: string;
        created_at: string;
      }) => ({
        id: r.id,
        report_type: r.report_type,
        title: r.title,
        status: r.status,
        assigned_admin: null,
        decision: decisionMap.get(r.id) ?? null,
        created_at: r.created_at,
      })
    );

    return { success: true, data: reports };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch reports.",
    };
  }
}

export async function fetchUserBlockchainActivity(
  userId: string
): Promise<DetailResult<UserBlockchainActivity[]>> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Not authenticated." };

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || profile.role !== "admin") {
      return { success: false, message: "Unauthorized." };
    }

    const { data, error } = await supabase
      .from("registered_arts")
      .select(
        `
        id, title, tx_hash, chain, block_number, work_id, status, created_at
      `
      )
      .eq("owner_id", userId)
      .not("tx_hash", "is", null)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return { success: false, message: error.message };
    }

    const activities: UserBlockchainActivity[] = (data ?? []).map(
      (a: {
        id: string;
        title: string;
        tx_hash: string | null;
        chain: string | null;
        block_number: number | null;
        work_id: string | null;
        status: string;
        created_at: string;
      }) => ({
        id: a.id,
        artwork_title: a.title,
        artwork_id: a.id,
        tx_hash: a.tx_hash,
        chain: a.chain,
        block_number: a.block_number,
        work_id: a.work_id,
        status: a.status,
        created_at: a.created_at,
        verification_status:
          a.tx_hash && a.status === "registered" ? "verified" : "pending",
      })
    );

    return { success: true, data: activities };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch blockchain activity.",
    };
  }
}

export async function fetchUserTimeline(
  userId: string
): Promise<DetailResult<TimelineEvent[]>> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Not authenticated." };

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || profile.role !== "admin") {
      return { success: false, message: "Unauthorized." };
    }

    // Fetch user creation
    const { data: userData } = await supabase
      .from("users")
      .select("created_at")
      .eq("id", userId)
      .single();

    const timeline: TimelineEvent[] = [];

    // Account created
    if (userData) {
      timeline.push({
        id: "account-created",
        type: "account_created",
        title: "Account Created",
        description: "User registered on the platform.",
        related_id: null,
        link: null,
        created_at: userData.created_at,
      });
    }

    // Fetch artworks
    const { data: artworks } = await supabase
      .from("registered_arts")
      .select("id, title, created_at, tx_hash")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    for (const artwork of artworks ?? []) {
      timeline.push({
        id: `artwork-${artwork.id}`,
        type: "artwork_uploaded",
        title: "Artwork Uploaded",
        description: artwork.title,
        related_id: artwork.id,
        link: `/art/${artwork.id}`,
        created_at: artwork.created_at,
      });

      if (artwork.tx_hash) {
        timeline.push({
          id: `blockchain-${artwork.id}`,
          type: "blockchain_recorded",
          title: "Artwork Registered on Blockchain",
          description: artwork.title,
          related_id: artwork.id,
          link: `/art/${artwork.id}`,
          created_at: artwork.created_at,
        });
      }
    }

    // Fetch reports filed
    const { data: filedReports } = await supabase
      .from("reports")
      .select("id, title, created_at")
      .eq("reporter_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    for (const report of filedReports ?? []) {
      timeline.push({
        id: `report-filed-${report.id}`,
        type: "report_filed",
        title: "Report Filed",
        description: report.title,
        related_id: report.id,
        link: `/admin/reports/${report.id}`,
        created_at: report.created_at,
      });
    }

    // Fetch reports against
    const { data: reportsAgainst } = await supabase
      .from("reports")
      .select(
        `
        id, title, created_at,
        reported_art_post:art_posts!reports_reported_art_post_id_fkey (
          registered_arts:registered_arts!art_posts_art_id_fkey (
            owner_id
          )
        )
      `
      )
      .filter("reported_art_post.registered_arts.owner_id", "eq", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    for (const report of (reportsAgainst ?? []) as Array<{
      id: string;
      title: string;
      created_at: string;
    }>) {
      timeline.push({
        id: `report-received-${report.id}`,
        type: "report_received",
        title: "Report Received",
        description: report.title,
        related_id: report.id,
        link: `/admin/reports/${report.id}`,
        created_at: report.created_at,
      });
    }

    // Fetch similarity scans
    const { data: scans } = await supabase
      .from("art_similarity_scans")
      .select(
        `
        id, created_at, best_similarity_percentage, total_matches,
        art_id,
        registered_arts!art_similarity_scans_art_id_fkey ( title )
      `
      )
      .eq("owner_id", userId)
      .eq("success", true)
      .gt("total_matches", 0)
      .order("created_at", { ascending: false })
      .limit(20);

    for (const scan of (scans ?? []) as Array<{
      id: string;
      created_at: string;
      best_similarity_percentage: number | null;
      total_matches: number;
      art_id: string;
      registered_arts: { title: string } | { title: string }[] | null;
    }>) {
      const artData = Array.isArray(scan.registered_arts)
        ? scan.registered_arts[0]
        : scan.registered_arts;
      timeline.push({
        id: `scan-${scan.id}`,
        type: "similarity_detected",
        title: "Similarity Detected",
        description: `${
          artData?.title ?? "Unknown artwork"
        } - ${scan.total_matches} match(es), ${scan.best_similarity_percentage ?? 0}%`,
        related_id: scan.art_id,
        link: `/art/${scan.art_id}`,
        created_at: scan.created_at,
      });
    }

    // Fetch notifications
    const { data: notifications } = await supabase
      .from("notifications")
      .select("id, type, title, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    for (const notif of notifications ?? []) {
      timeline.push({
        id: `notif-${notif.id}`,
        type: "notification_received",
        title: notif.title,
        description: `Type: ${notif.type}`,
        related_id: notif.id,
        link: null,
        created_at: notif.created_at,
      });
    }

    // Fetch admin audit logs
    const { data: auditLogs } = await supabase
      .from("admin_audit_logs")
      .select("id, action, reason, created_at")
      .eq("target_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    for (const log of auditLogs ?? []) {
      timeline.push({
        id: `admin-${log.id}`,
        type: "admin_action",
        title: `Admin Action: ${formatAction(log.action)}`,
        description: log.reason ?? "No reason provided.",
        related_id: log.id,
        link: null,
        created_at: log.created_at,
      });
    }

    // Sort newest first
    timeline.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return { success: true, data: timeline };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch timeline.",
    };
  }
}

function formatAction(action: string): string {
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}