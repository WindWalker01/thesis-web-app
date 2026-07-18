// ============================================
// GET /api/reports/unread - Get unread message counts
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/server-utils";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reportIds = searchParams.getAll("report_id");

    if (reportIds.length === 0) {
      return NextResponse.json({ success: true, data: {} });
    }

    const supabase = await createSupabaseServerClient();

    // Fetch unread counts for each report
    const unreadCounts: Record<string, number> = {};

    for (const reportId of reportIds) {
      const { count, error } = await supabase
        .from("report_comments")
        .select("*", { count: "exact", head: true })
        .eq("report_id", reportId)
        .neq("user_id", user.id)
        .is("read_at", null);

      if (!error) {
        unreadCounts[reportId] = count ?? 0;
      }
    }

    return NextResponse.json({ success: true, data: unreadCounts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch unread counts";
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}