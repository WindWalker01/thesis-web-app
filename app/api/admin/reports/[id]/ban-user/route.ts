// ============================================
// POST /api/admin/reports/[id]/ban-user - Ban user from report
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

    const body = await request.json();
    const { user_id, reason } = body;

    if (!user_id || !reason) {
      return NextResponse.json(
        { success: false, error: { message: "user_id and reason are required" } },
        { status: 400 }
      );
    }

    const result = await adminActions.banUser({
      user_id,
      reason,
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
      { success: false, error: { message: error instanceof Error ? error.message : "Failed to ban user" } },
      { status: 500 }
    );
  }
}