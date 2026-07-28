// ============================================
// POST /api/admin/reports/[id]/suspend-user - Suspend user from report
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/server-utils";
import * as adminActions from "@/features/admin/user-management/server/admin-actions";

/**
 * Resolves the reported user ID from a report.
 * Looks up the art post owner from the report's reported_art_post_id.
 */
async function resolveReportedUserId(reportId: string): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data: report } = await supabase
    .from("reports")
    .select("reported_art_post_id")
    .eq("id", reportId)
    .single();

  if (!report?.reported_art_post_id) return null;

  const { data: artPost } = await supabase
    .from("art_posts")
    .select("art_id")
    .eq("id", report.reported_art_post_id)
    .single();

  if (!artPost?.art_id) return null;

  const { data: artwork } = await supabase
    .from("registered_arts")
    .select("owner_id")
    .eq("id", artPost.art_id)
    .single();

  return artwork?.owner_id ?? null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id: reportId } = await params;
    const body = await request.json();
    const { user_id, reason, duration, duration_days } = body;

    // Resolve user_id from the report if not provided
    const targetUserId = user_id || (await resolveReportedUserId(reportId));

    if (!targetUserId || !reason || !duration) {
      return NextResponse.json(
        { success: false, error: { message: "user_id, reason, and duration are required" } },
        { status: 400 }
      );
    }

    if (duration === "temporary" && (!duration_days || duration_days < 1)) {
      return NextResponse.json(
        { success: false, error: { message: "duration_days is required for temporary suspension" } },
        { status: 400 }
      );
    }

    const result = await adminActions.suspendUser({
      user_id: targetUserId,
      reason,
      duration,
      duration_days,
      admin_notes: `Suspended from report: ${reportId}`,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: result.message } },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : "Failed to suspend user" } },
      { status: 500 }
    );
  }
}
