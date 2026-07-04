"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserExportRow, UserFilters, UserSortOption } from "../types";

export async function exportUsersCSV({
  search = "",
  filters,
  sort,
}: {
  search?: string;
  filters?: UserFilters;
  sort?: UserSortOption;
} = {}): Promise<
  | { success: true; data: UserExportRow[] }
  | { success: false; message: string }
> {
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

    // Build query - fetch ALL matching users (no pagination limit)
    let query = supabase
      .from("users")
      .select("id, username, first_name, last_name, email, role, account_status, is_verified, created_at");

    if (search) {
      const term = `%${search}%`;
      query = query.or(
        `username.ilike.${term},first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term}`
      );
    }

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

    switch (sort) {
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "alphabetical":
        query = query.order("last_name", { ascending: true });
        break;
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    const { data: rawUsers, error } = await query;

    if (error) {
      return { success: false, message: error.message };
    }

    // Fetch artwork and report counts for all users
    const userIds = (rawUsers ?? []).map((u: { id: string }) => u.id);

    const [artworkCounts, reportCounts] = await Promise.all([
      supabase
        .from("registered_arts")
        .select("owner_id", { count: "exact", head: false })
        .in("owner_id", userIds),
      supabase
        .from("reports")
        .select("reporter_id", { count: "exact", head: false })
        .in("reporter_id", userIds),
    ]);

    const artworkMap = new Map<string, number>();
    for (const item of artworkCounts.data ?? []) {
      const id = (item as { owner_id: string }).owner_id;
      artworkMap.set(id, (artworkMap.get(id) ?? 0) + 1);
    }

    const reportMap = new Map<string, number>();
    for (const item of reportCounts.data ?? []) {
      const id = (item as { reporter_id: string }).reporter_id;
      reportMap.set(id, (reportMap.get(id) ?? 0) + 1);
    }

    // Create audit log for export
    await supabase.from("admin_audit_logs").insert({
      admin_id: user.id,
      action: "export_users",
      reason: `Exported ${rawUsers?.length ?? 0} users to CSV.`,
      metadata: {
        count: rawUsers?.length ?? 0,
        filters: filters ?? {},
        search,
      },
    });

    const data: UserExportRow[] = (rawUsers ?? []).map(
      (u: {
        id: string;
        username: string;
        email: string | null;
        role: string;
        account_status: string;
        is_verified: boolean;
        created_at: string;
      }) => ({
        username: u.username,
        email: u.email ?? "",
        role: u.role,
        status: u.account_status ?? "active",
        verified: u.is_verified ? "Yes" : "No",
        registration_date: new Date(u.created_at).toLocaleDateString(),
        artwork_count: artworkMap.get(u.id) ?? 0,
        report_count: reportMap.get(u.id) ?? 0,
      })
    );

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to export users.",
    };
  }
}