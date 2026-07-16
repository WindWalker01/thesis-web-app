// ============================================
// POST /api/reports - Create a new report
// GET /api/reports - Get current user's reports
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/server-utils";
import { createReportSchema } from "@/features/reports/schemas/report-schemas";
import * as repo from "@/features/reports/server/reports-repository";
import * as service from "@/features/reports/server/reports-service";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = createReportSchema.safeParse(body);

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

    const { reported_art_post_id, report_type, title, description } = validation.data;
    const supabase = await createSupabaseServerClient();

    // Create report
    const report = await repo.insertReport(supabase, {
      reporter_id: user.id,
      reported_art_post_id,
      report_type,
      title,
      description,
    });

    // Create audit record
    await service.createAuditRecord(supabase, {
      report_id: report.id,
      admin_id: user.id,
      action: "report_created",
      previous_status: null,
      new_status: "pending_review",
      notes: "Report submitted",
    });

    // Notify admins
    await service.createAdminNotification(supabase, {
      type: "report_submitted",
      title: "New Report Submitted",
      message: `A new report "${title}" has been submitted.`,
      reportId: report.id,
    });

    return NextResponse.json({ success: true, data: report }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create report";
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const reports = await repo.getUserReports(supabase, user.id);

    return NextResponse.json({ success: true, data: reports });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch reports";
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}