// ============================================
// GET /api/reports/[id] - Get report details (user-scoped)
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/server-utils";
import * as repo from "@/features/reports/server/reports-repository";

export async function GET(
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

    // Only allow users to access their own reports
    const report = await repo.getUserReportById(supabase, user.id, id);
    if (!report) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Report not found" } },
        { status: 404 }
      );
    }

    // Fetch related data
    const [evidence, comments, decision, actions] = await Promise.all([
      repo.getReportEvidence(supabase, id),
      repo.getReportComments(supabase, id),
      repo.getReportDecision(supabase, id),
      repo.getReportActions(supabase, id),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        report,
        evidence,
        comments,
        decision,
        actions,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch report";
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}