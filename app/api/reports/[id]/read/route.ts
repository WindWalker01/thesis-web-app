// ============================================
// PATCH /api/reports/[id]/read - Mark messages as read
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/server-utils";
import { markReadSchema } from "@/features/reports/schemas/chat-schema";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    // Verify access: user must be either the reporter or an admin
    const { data: report } = await supabase
      .from("reports")
      .select("reporter_id")
      .eq("id", id)
      .single();

    if (!report) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Report not found" } },
        { status: 404 }
      );
    }

    // Check if user is reporter or admin
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin";
    const isReporter = report.reporter_id === user.id;

    if (!isAdmin && !isReporter) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }

    // Mark all messages from other users as read
    const { error } = await supabase.rpc("mark_report_messages_read", {
      p_report_id: id,
      p_user_id: user.id,
    });

    if (error) {
      // Fallback: direct update
      const { error: updateError } = await supabase
        .from("report_comments")
        .update({ read_at: new Date().toISOString() })
        .eq("report_id", id)
        .neq("user_id", user.id)
        .is("read_at", null);

      if (updateError) {
        throw new Error(`Failed to mark messages as read: ${updateError.message}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to mark messages as read";
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}