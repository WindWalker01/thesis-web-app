// ============================================
// POST /api/admin/reports/[id]/request-evidence - Request additional evidence
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/server-utils";
import { requestEvidenceSchema } from "@/features/reports/schemas/report-schemas";
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

    // Verify admin
    const isAdmin = await service.isAdminUser(user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin access required" } },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validation = requestEvidenceSchema.safeParse(body);

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

    const result = await service.requestEvidenceWithAudit(supabase, {
      reportId: id,
      adminId: user.id,
      message: validation.data.message,
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to request evidence";
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}