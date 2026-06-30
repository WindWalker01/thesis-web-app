// ============================================
// GET /api/admin/reports/[id] - Get full report details
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server-utils";
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

    // Verify admin
    const isAdmin = await service.isAdminUser(user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin access required" } },
        { status: 403 }
      );
    }

    const { id } = await params;
    const detail = await repo.getAdminReportDetail(id);

    if (!detail) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Report not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: detail });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch report details";
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}