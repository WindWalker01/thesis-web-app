// ============================================
// POST /api/admin/reports/[id]/suspend-user - Suspend user from report
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server-utils";
import * as adminActions from "@/features/admin/user-management/server/admin-actions";

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

    if (!user_id || !reason || !duration) {
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
      user_id,
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