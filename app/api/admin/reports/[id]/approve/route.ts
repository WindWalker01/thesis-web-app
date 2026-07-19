// ============================================
// POST /api/admin/reports/[id]/approve - Approve report (no violation)
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/server-utils";
import { approveReportSchema } from "@/features/reports/schemas/report-schemas";
import * as service from "@/features/reports/server/reports-service";

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

    const isAdmin = await service.isAdminUser(user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin access required" } },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validation = approveReportSchema.safeParse(body);

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

    const result = await service.approveReport(supabase, {
      reportId: id,
      adminId: user.id,
      summary: validation.data.summary,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to approve report";
    const statusCode = message.includes("not found")
      ? 404
      : message.includes("already resolved")
        ? 400
        : 500;

    return NextResponse.json(
      { success: false, error: { code: statusCode === 500 ? "INTERNAL_ERROR" : "VALIDATION_ERROR", message } },
      { status: statusCode }
    );
  }
}