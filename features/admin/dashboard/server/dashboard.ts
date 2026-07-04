"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatTimeAgo } from "@/lib/client-utils";
import type {
  AdminDashboardResult,
  ActivityItem,
  RecentReport,
  LatestArtwork,
  TopArtist,
  MostReportedArtwork,
  AdminNotification,
  SystemServiceStatus,
  ChartDataPoint,
  ReportStatusData,
  CategoryData,
  EngagementData,
} from "../types";

export async function fetchAdminDashboardData(): Promise<AdminDashboardResult> {
  try {
    const supabase = await createSupabaseServerClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Not authenticated." };
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return { success: false, message: "Unauthorized. Admin access required." };
    }

    // Run all queries in parallel for performance
    const [
      totalUsersResult,
      verifiedArtistsResult,
      totalArtworksResult,
      pendingReportsResult,
      resolvedReportsResult,
      blockchainRegistrationsResult,
      similarityScansResult,
      totalUpvotesResult,
      uploadChartRaw,
      newUsersRaw,
      reportStatusesRaw,
      categoriesRaw,
      engagementRaw,
      recentNotificationsRaw,
      recentReportsRaw,
      latestArtworksRaw,
      leaderboardRaw,
      mostReportedRaw,
      adminNotificationsRaw,
    ] = await Promise.all([
      // Stats queries
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("is_verified", true),
      supabase.from("registered_arts").select("*", { count: "exact", head: true }),
      supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "resolved"),
      supabase.from("registered_arts").select("*", { count: "exact", head: true }).not("tx_hash", "is", null),
      supabase.from("art_similarity_scans").select("*", { count: "exact", head: true }).eq("success", true).gt("total_matches", 0),
      supabase.from("art_posts").select("upvote_count"),
      // Chart 1: Artwork uploads last 30 days
      supabase
        .from("registered_arts")
        .select("created_at")
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: true }),
      // Chart 2: New users last 30 days
      supabase
        .from("users")
        .select("created_at")
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: true }),
      // Chart 3: Report statuses
      supabase.from("reports").select("status"),
      // Chart 4: Artwork categories
      supabase.from("art_genres").select("genre_id, genres!inner(name)") as never,
      // Chart 5: Daily engagement
      supabase
        .from("art_reactions")
        .select("created_at, reaction_type")
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .eq("reaction_type", "upvote")
        .order("created_at", { ascending: true }),
      // Recent activity
      supabase
        .from("notifications")
        .select("id, type, title, message, user_id, related_art_id, related_report_id, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
      // Recent reports
      supabase
        .from("reports")
        .select(`
          id, title, report_type, status, created_at,
          reporter:users!reports_reporter_id_fkey ( first_name, middle_name, last_name, username, c_profile_image )
        `)
        .order("created_at", { ascending: false })
        .limit(5),
      // Latest artworks
      supabase
        .from("registered_arts")
        .select(`
          id, title, c_secure_url, status, created_at,
          owner:users!registered_arts_owner_id_fkey ( id, first_name, middle_name, last_name )
        `)
        .order("created_at", { ascending: false })
        .limit(6),
      // Leaderboard: top artists by total upvotes
      supabase
        .from("users")
        .select(`
          id, username, first_name, middle_name, last_name, c_profile_image, is_verified,
          artwork_count:registered_arts(count)
        `)
        .order("created_at", { ascending: false })
        .limit(50),
      // Most reported artworks
      supabase
        .from("reports")
        .select(`
          reported_art_post_id,
          report_type,
          status,
          reported_art_post:art_posts!reports_reported_art_post_id_fkey (
            id,
            registered_arts:registered_arts!art_posts_art_id_fkey ( title, c_secure_url )
          )
        `),
      // Admin notifications
      supabase
        .from("notifications")
        .select("id, type, title, message, is_read, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    // ── Parse Stats ──

    const totalUsers = totalUsersResult.count ?? 0;
    const verifiedArtists = verifiedArtistsResult.count ?? 0;
    const totalArtworks = totalArtworksResult.count ?? 0;
    const pendingReports = pendingReportsResult.count ?? 0;
    const resolvedReports = resolvedReportsResult.count ?? 0;
    const blockchainRegistrations = blockchainRegistrationsResult.count ?? 0;
    const detectedSimilarities = similarityScansResult.count ?? 0;
    const totalUpvotes = (totalUpvotesResult.data ?? []).reduce(
      (sum: number, post: { upvote_count: number }) => sum + (post.upvote_count ?? 0),
      0
    );

    // ── Chart 1: Artwork Uploads (line) ──

    const uploadChart = buildDateChart(
      (uploadChartRaw.data ?? []) as { created_at: string }[],
      "created_at"
    );

    // ── Chart 2: New Users (bar) ──

    const newUsersChart = buildDateChart(
      (newUsersRaw.data ?? []) as { created_at: string }[],
      "created_at"
    );

    // ── Chart 3: Report Statuses (pie) ──

    const statusMap = new Map<string, number>();
    for (const row of (reportStatusesRaw.data ?? []) as { status: string }[]) {
      statusMap.set(row.status, (statusMap.get(row.status) ?? 0) + 1);
    }
    const reportStatuses: ReportStatusData[] = [
      { name: "Open", value: statusMap.get("open") ?? 0, color: "var(--chart-1)" },
      { name: "Under Review", value: statusMap.get("under_review") ?? 0, color: "var(--chart-3)" },
      { name: "Waiting", value: statusMap.get("waiting_for_reporter") ?? 0, color: "var(--chart-4)" },
      { name: "Resolved", value: statusMap.get("resolved") ?? 0, color: "var(--chart-2)" },
      { name: "Rejected", value: statusMap.get("rejected") ?? 0, color: "var(--chart-5)" },
      { name: "Closed", value: statusMap.get("closed") ?? 0, color: "hsl(var(--destructive))" },
    ].filter((s) => s.value > 0);

    // ── Chart 4: Artwork Categories (horizontal bar) ──

    const genreMap = new Map<string, number>();
    // Supabase nested joins return the genres field as an array due to the many-to-many relationship
    const catResult = categoriesRaw as unknown as {
      data: { genres: { name: string } | { name: string }[] | null }[] | null;
    };
    for (const row of catResult.data ?? []) {
      const g = row.genres;
      const list = Array.isArray(g) ? g : g ? [g] : [];
      for (const item of list) {
        if (item?.name) {
          genreMap.set(item.name, (genreMap.get(item.name) ?? 0) + 1);
        }
      }
    }
    const artworkCategories: CategoryData[] = Array.from(genreMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // ── Chart 5: Daily Engagement (area) ──

    const engagementMap = new Map<string, number>();
    for (const row of (engagementRaw.data ?? []) as { created_at: string }[]) {
      const date = new Date(row.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      engagementMap.set(date, (engagementMap.get(date) ?? 0) + 1);
    }
    const dailyEngagement: EngagementData[] = Array.from(engagementMap.entries())
      .map(([date, upvotes]) => ({ date, upvotes }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // ── Recent Activity ──

    const recentActivity: ActivityItem[] = ((recentNotificationsRaw.data ?? []) as Array<{
      id: string;
      type: string;
      title: string;
      message: string;
      user_id: string;
      related_art_id: string | null;
      related_report_id: string | null;
      created_at: string;
    }>).map((n) => ({
      id: n.id,
      type: mapNotificationType(n.type),
      user: null,
      description: n.title,
      timestamp: formatTimeAgo(n.created_at),
      link: n.related_report_id
        ? `/admin/reports/${n.related_report_id}`
        : n.related_art_id
          ? `/art/${n.related_art_id}`
          : null,
    }));

    // ── Recent Reports ──

    const recentReports: RecentReport[] = ((recentReportsRaw.data ?? []) as Array<{
      id: string;
      title: string;
      report_type: string;
      status: string;
      created_at: string;
      reporter: { first_name: string; middle_name: string; last_name: string | null; c_profile_image: string | null } | { first_name: string; middle_name: string; last_name: string | null; c_profile_image: string | null }[] | null;
    }>).map((r) => {
      const reporter = Array.isArray(r.reporter) ? r.reporter[0] : r.reporter;
      return {
        id: r.id,
        title: r.title,
        reporter: {
          name: [reporter?.first_name, reporter?.middle_name, reporter?.last_name].filter(Boolean).join(" ") || "Unknown",
          avatar: reporter?.c_profile_image ?? null,
        },
        status: r.status,
        report_type: r.report_type,
        created_at: formatTimeAgo(r.created_at),
      };
    });

    // ── Latest Artworks ──

    const latestArtworks: LatestArtwork[] = ((latestArtworksRaw.data ?? []) as Array<{
      id: string;
      title: string;
      c_secure_url: string | null;
      status: string;
      created_at: string;
      owner: { id: string; first_name: string; middle_name: string; last_name: string | null } | { id: string; first_name: string; middle_name: string; last_name: string | null }[] | null;
    }>).map((a) => {
      const owner = Array.isArray(a.owner) ? a.owner[0] : a.owner;
      return {
        id: a.id,
        title: a.title,
        thumbnail: a.c_secure_url,
        artist: [owner?.first_name, owner?.middle_name, owner?.last_name].filter(Boolean).join(" ") || "Unknown",
        artist_id: owner?.id ?? "",
        category: null,
        created_at: formatTimeAgo(a.created_at),
        blockchain_status: a.status,
      };
    });

    // ── Leaderboard ──

    const { data: postUpvotes } = await supabase
      .from("art_posts")
      .select("user_id, upvote_count");

    const userUpvoteMap = new Map<string, number>();
    for (const post of (postUpvotes ?? []) as { user_id: string; upvote_count: number }[]) {
      userUpvoteMap.set(
        post.user_id,
        (userUpvoteMap.get(post.user_id) ?? 0) + (post.upvote_count ?? 0)
      );
    }

    const leaderboard: TopArtist[] = ((leaderboardRaw.data ?? []) as Array<{
      id: string;
      username: string;
      first_name: string;
      middle_name: string;
      last_name: string | null;
      c_profile_image: string | null;
      is_verified: boolean;
      artwork_count: { count: number }[] | { count: number } | null;
    }>)
      .map((u) => {
        const artworkCountArr = Array.isArray(u.artwork_count)
          ? u.artwork_count
          : u.artwork_count
            ? [u.artwork_count]
            : [];
        const artworks = artworkCountArr.length > 0 ? artworkCountArr[0].count : 0;
        const upvotes = userUpvoteMap.get(u.id) ?? 0;
        return {
          id: u.id,
          username: u.username,
          first_name: u.first_name,
          middle_name: u.middle_name,
          last_name: u.last_name,
          avatar: u.c_profile_image,
          artwork_count: artworks,
          total_upvotes: upvotes,
          is_verified: u.is_verified,
        };
      })
      .sort((a, b) => b.total_upvotes - a.total_upvotes)
      .slice(0, 5);

    // ── Most Reported Artworks ──

    const reportGroupMap = new Map<
      string,
      { count: number; reasons: Map<string, number>; status: string; title: string; thumbnail: string | null }
    >();

    const mostReportedRows = mostReportedRaw as unknown as {
      data: Array<{
        reported_art_post_id: string;
        report_type: string;
        status: string;
        reported_art_post: {
          id: string;
          registered_arts: { title: string; c_secure_url: string | null } | { title: string; c_secure_url: string | null }[] | null;
        } | null;
      }> | null;
    };

    for (const row of mostReportedRows.data ?? []) {
      const postId = row.reported_art_post_id;
      if (!reportGroupMap.has(postId)) {
        const artData = row.reported_art_post;
        const registered = artData
          ? Array.isArray(artData.registered_arts)
            ? artData.registered_arts[0]
            : artData.registered_arts
          : null;
        reportGroupMap.set(postId, {
          count: 0,
          reasons: new Map(),
          status: row.status,
          title: registered?.title ?? "Unknown Artwork",
          thumbnail: registered?.c_secure_url ?? null,
        });
      }
      const entry = reportGroupMap.get(postId)!;
      entry.count++;
      entry.reasons.set(row.report_type, (entry.reasons.get(row.report_type) ?? 0) + 1);
    }

    const mostReported: MostReportedArtwork[] = Array.from(reportGroupMap.entries())
      .map(([artPostId, entry]) => {
        const topReason = Array.from(entry.reasons.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Unknown";
        return {
          art_post_id: artPostId,
          artwork_title: entry.title,
          thumbnail: entry.thumbnail,
          report_count: entry.count,
          top_reason: topReason,
          current_status: entry.status,
        };
      })
      .sort((a, b) => b.report_count - a.report_count)
      .slice(0, 5);

    // ── Admin Notifications ──

    const notifications: AdminNotification[] = ((adminNotificationsRaw.data ?? []) as Array<{
      id: string;
      type: string;
      title: string;
      message: string;
      is_read: boolean;
      created_at: string;
    }>).map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      is_read: n.is_read,
      created_at: formatTimeAgo(n.created_at),
    }));

    // ── System Health ──

    const systemHealth: SystemServiceStatus[] = [
      {
        name: "Supabase",
        status: "healthy",
        endpoint: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      },
      {
        name: "Cloudinary",
        status: "healthy",
        endpoint: "https://api.cloudinary.com/v1_1/" + (process.env.CLOUDINARY_NAME ?? ""),
      },
      {
        name: "Blockchain Service",
        status: "healthy",
        endpoint: process.env.AMOY_RPC_URL ?? "",
      },
      {
        name: "Python Hashing API",
        status: "healthy",
        endpoint: process.env.NEXT_PUBLIC_DIGITAL_ART_API_URL ?? "",
      },
      {
        name: "Image Classification API",
        status: "healthy",
        endpoint: process.env.DIGITAL_ART_API_URL ?? "",
      },
    ];

    return {
      success: true,
      data: {
        stats: {
          totalUsers,
          verifiedArtists,
          totalArtworks,
          pendingReports,
          resolvedReports,
          blockchainRegistrations,
          detectedSimilarities,
          totalUpvotes,
        },
        charts: {
          artworkUploads: uploadChart,
          newUsers: newUsersChart,
          reportStatuses,
          artworkCategories,
          dailyEngagement,
        },
        recentActivity,
        recentReports,
        latestArtworks,
        leaderboard,
        mostReported,
        notifications,
        systemHealth,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to load admin dashboard.",
    };
  }
}

function buildDateChart(
  rows: { created_at: string }[],
  _field: string
): ChartDataPoint[] {
  const map = new Map<string, number>();

  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    map.set(key, 0);
  }

  for (const row of rows) {
    const d = new Date(row.created_at);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (map.has(key)) {
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }

  return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
}

function mapNotificationType(type: string): ActivityItem["type"] {
  if (type.includes("blockchain")) return "blockchain";
  if (type.includes("report") || type.includes("scan_flagged")) return "report";
  if (type.includes("artwork") || type.includes("scan_completed")) return "upload";
  if (type.includes("system")) return "system";
  if (type.includes("verify")) return "verify";
  return "system";
}