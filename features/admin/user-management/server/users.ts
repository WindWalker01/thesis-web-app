"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  UsersResult,
  UserRow,
  UserFilters,
  UserSortOption,
  UserManagementStats,
} from "../types";

export async function fetchUsers({
  page = 1,
  perPage = 50,
  search = "",
  filters,
  sort,
}: {
  page?: number;
  perPage?: number;
  search?: string;
  filters?: UserFilters;
  sort?: UserSortOption;
} = {}): Promise<UsersResult> {
  try {
    const supabase = await createSupabaseServerClient();

    // Verify authentication and admin role
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Not authenticated." };

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || profile.role !== "admin") {
      return { success: false, message: "Unauthorized. Admin access required." };
    }

    // Build the query with all necessary joins
    let query = supabase
      .from("users")
      .select(
        `
        id, username, first_name, last_name, middle_name, email, c_profile_image,
        role, account_status, is_verified, created_at, last_active,
        country
      `,
        { count: "exact" }
      );

    // ── Search ──
    if (search) {
      const term = `%${search}%`;
      query = query.or(
        `username.ilike.${term},first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term}`
      );
    }

    // ── Filters ──
    if (filters) {
      if (filters.role && filters.role !== "all") {
        query = query.eq("role", filters.role);
      }
      if (filters.account_status && filters.account_status !== "all") {
        query = query.eq("account_status", filters.account_status);
      }
      if (filters.is_verified !== null) {
        query = query.eq("is_verified", filters.is_verified);
      }
      if (filters.date_from) {
        query = query.gte("created_at", filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte("created_at", filters.date_to);
      }
    }

    // ── Sort ──
    switch (sort) {
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "most_active":
        query = query.order("last_active", { ascending: false });
        break;
      case "alphabetical":
        query = query.order("last_name", { ascending: true });
        break;
      case "newest":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    // ── Pagination ──
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data: rawUsers, count: totalCount, error } = await query;

    if (error) {
      return { success: false, message: error.message };
    }

    if (!rawUsers) {
      return {
        success: true,
        data: [],
        totalCount: 0,
        pageCount: 0,
      };
    }

    // ── Fetch aggregate counts for each user ──
    const userIds = rawUsers.map((u: { id: string }) => u.id);

    // Parallel queries for counts
    const [
      artworkCountsResult,
      postCountsResult,
      reportsFiledResult,
      reportsAgainstResult,
    ] = await Promise.all([
      supabase
        .from("registered_arts")
        .select("owner_id", { count: "exact", head: false })
        .in("owner_id", userIds),
      supabase
        .from("art_posts")
        .select("user_id", { count: "exact", head: false })
        .in("user_id", userIds)
        .eq("visibility", "public")
        .eq("is_archived", false),
      supabase
        .from("reports")
        .select("reporter_id", { count: "exact", head: false })
        .in("reporter_id", userIds),
      supabase
        .from("reports")
        .select(
          `
          reported_art_post_id,
          reported_art_post:art_posts!reports_reported_art_post_id_fkey (
            art_id,
            registered_arts:registered_arts!art_posts_art_id_fkey (
              owner_id
            )
          )
        `
        )
        .in("reported_art_post.registered_arts.owner_id", userIds),
    ]);

    // Build count maps
    const artworkCountMap = buildCountMap(
      artworkCountsResult.data ?? [],
      "owner_id"
    );
    const postCountMap = buildCountMap(postCountsResult.data ?? [], "user_id");
    const reportsFiledMap = buildCountMap(
      reportsFiledResult.data ?? [],
      "reporter_id"
    );

    // Reports against: count reports where the reported artwork's owner matches
    const reportsAgainstMap = new Map<string, number>();
    const reportsAgainstData = reportsAgainstResult.data ?? [];
    for (const report of reportsAgainstData as Array<{
      reported_art_post?: {
        registered_arts?: { owner_id: string } | { owner_id: string }[] | null;
      } | null;
    }>) {
      const post = report.reported_art_post;
      if (!post) continue;
      const registered = Array.isArray(post.registered_arts)
        ? post.registered_arts[0]
        : post.registered_arts;
      if (registered?.owner_id && userIds.includes(registered.owner_id)) {
        reportsAgainstMap.set(
          registered.owner_id,
          (reportsAgainstMap.get(registered.owner_id) ?? 0) + 1
        );
      }
    }

    // Post-filter for has_reports, has_uploaded_artwork, has_blockchain_registrations
    let filteredUserIds = new Set(userIds);

    if (filters) {
      if (filters.has_uploaded_artwork === true) {
        const usersWithArtwork = new Set(
          (artworkCountsResult.data ?? []).map(
            (r: { owner_id: string }) => r.owner_id
          )
        );
        filteredUserIds = new Set(
          [...filteredUserIds].filter((id) => usersWithArtwork.has(id))
        );
      } else if (filters.has_uploaded_artwork === false) {
        const usersWithArtwork = new Set(
          (artworkCountsResult.data ?? []).map(
            (r: { owner_id: string }) => r.owner_id
          )
        );
        filteredUserIds = new Set(
          [...filteredUserIds].filter((id) => !usersWithArtwork.has(id))
        );
      }

      if (filters.has_reports === true) {
        const usersWithReports = new Set([
          ...reportsFiledMap.keys(),
          ...reportsAgainstMap.keys(),
        ]);
        filteredUserIds = new Set(
          [...filteredUserIds].filter((id) => usersWithReports.has(id))
        );
      } else if (filters.has_reports === false) {
        const usersWithReports = new Set([
          ...reportsFiledMap.keys(),
          ...reportsAgainstMap.keys(),
        ]);
        filteredUserIds = new Set(
          [...filteredUserIds].filter((id) => !usersWithReports.has(id))
        );
      }

      if (filters.has_blockchain_registrations === true) {
        const { data: blockchainUsers } = await supabase
          .from("registered_arts")
          .select("owner_id")
          .in("owner_id", [...filteredUserIds])
          .not("tx_hash", "is", null);
        const usersWithBlockchain = new Set(
          (blockchainUsers ?? []).map((r: { owner_id: string }) => r.owner_id)
        );
        filteredUserIds = new Set(
          [...filteredUserIds].filter((id) => usersWithBlockchain.has(id))
        );
      } else if (filters.has_blockchain_registrations === false) {
        const { data: blockchainUsers } = await supabase
          .from("registered_arts")
          .select("owner_id")
          .in("owner_id", [...filteredUserIds])
          .not("tx_hash", "is", null);
        const usersWithBlockchain = new Set(
          (blockchainUsers ?? []).map((r: { owner_id: string }) => r.owner_id)
        );
        filteredUserIds = new Set(
          [...filteredUserIds].filter((id) => !usersWithBlockchain.has(id))
        );
      }
    }

    // Re-sort by most_reported if needed
    const sortedUsers = rawUsers.filter((u: { id: string }) =>
      filteredUserIds.has(u.id)
    );

    if (sort === "most_reported") {
      sortedUsers.sort((a: { id: string }, b: { id: string }) => {
        const aReports =
          (reportsFiledMap.get(a.id) ?? 0) +
          (reportsAgainstMap.get(a.id) ?? 0);
        const bReports =
          (reportsFiledMap.get(b.id) ?? 0) +
          (reportsAgainstMap.get(b.id) ?? 0);
        return bReports - aReports;
      });
    }

    // Map to UserRow
    const data: UserRow[] = sortedUsers.map(
      (u: {
        id: string;
        username: string;
        first_name: string;
        last_name: string;
        middle_name: string | null;
        email: string | null;
        c_profile_image: string | null;
        role: string;
        account_status: string;
        is_verified: boolean;
        created_at: string;
        last_active: string;
      }) => ({
        id: u.id,
        username: u.username,
        first_name: u.first_name,
        last_name: u.last_name,
        middle_name: u.middle_name,
        email: u.email,
        c_profile_image: u.c_profile_image,
        role: u.role as UserRow["role"],
        account_status: u.account_status as UserRow["account_status"],
        is_verified: u.is_verified,
        created_at: u.created_at,
        last_active: u.last_active,
        registered_artworks_count: artworkCountMap.get(u.id) ?? 0,
        public_posts_count: postCountMap.get(u.id) ?? 0,
        reports_filed_count: reportsFiledMap.get(u.id) ?? 0,
        reports_against_count: reportsAgainstMap.get(u.id) ?? 0,
      })
    );

    const pageCount = Math.ceil((totalCount ?? 0) / perPage);

    return {
      success: true,
      data,
      totalCount: totalCount ?? 0,
      pageCount,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch users.",
    };
  }
}

export async function fetchUserManagementStats(): Promise<
  | { success: true; data: UserManagementStats }
  | { success: false; message: string }
> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Not authenticated." };

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || profile.role !== "admin") {
      return { success: false, message: "Unauthorized." };
    }

    const now = new Date();
    const firstOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).toISOString();

    const [
      totalUsers,
      verifiedArtists,
      suspendedUsers,
      bannedUsers,
      newUsersThisMonth,
      artistsWithArtwork,
      usersWithReports,
    ] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("is_verified", true),
      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("account_status", "suspended"),
      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("account_status", "banned"),
      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .gte("created_at", firstOfMonth),
      supabase
        .from("registered_arts")
        .select("owner_id", { count: "exact", head: true }),
      supabase
        .from("reports")
        .select("reporter_id", { count: "exact", head: true }),
    ]);

    return {
      success: true,
      data: {
        total_users: totalUsers.count ?? 0,
        verified_artists: verifiedArtists.count ?? 0,
        suspended_users: suspendedUsers.count ?? 0,
        banned_users: bannedUsers.count ?? 0,
        new_users_this_month: newUsersThisMonth.count ?? 0,
        artists_with_artwork: artistsWithArtwork.count ?? 0,
        users_with_reports: usersWithReports.count ?? 0,
      },
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch stats.",
    };
  }
}

function buildCountMap(
  data: Record<string, unknown>[],
  field: string
): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of data) {
    const key = item[field] as string;
    if (key) {
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }
  return map;
}