// ============================================
// GET /api/reports/[id]/comments - Get report comments
// POST /api/reports/[id]/comments - Add a comment (reporter only)
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/server-utils";
import { addCommentSchema } from "@/features/reports/schemas/report-schemas";
import * as repo from "@/features/reports/server/reports-repository";
import * as service from "@/features/reports/server/reports-service";

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

    // Verify ownership
    const report = await repo.getUserReportById(supabase, user.id, id);
    if (!report) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Report not found" } },
        { status: 404 }
      );
    }

    const comments = await repo.getReportComments(supabase, id);
    return NextResponse.json({ success: true, data: comments });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch comments";
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
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
    const body = await request.json();
    const validation = addCommentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validation.error.issues.map((issue) => issue.message).join(", "),
          },
        },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Verify ownership
    const report = await repo.getUserReportById(supabase, user.id, id);
    if (!report) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Report not found" } },
        { status: 404 }
      );
    }

    const comment = await service.addCommentWithAudit(supabase, {
      reportId: id,
      userId: user.id,
      message: validation.data.message,
      isAdmin: false,
    });

    // Return the full comment with all chat fields
    const { data: fullComment } = await supabase
      .from("report_comments")
      .select("*")
      .eq("id", comment.id)
      .single();

    return NextResponse.json({ success: true, data: fullComment ?? comment }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add comment";
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}