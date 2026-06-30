// ============================================
// GET /api/admin/reports - Get admin reports list (paginated)
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server-utils";
import { adminReportsQuerySchema } from "@/features/reports/schemas/report-schemas";
import * as repo from "@/features/reports/server/reports-repository";
import * as service from "@/features/reports/server/reports-service";

export async function GET(request: NextRequest) {
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

    // Parse query params
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const validation = adminReportsQuerySchema.safeParse(searchParams);

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

    const { page, limit, status, reportType, search, sortBy, sortOrder } = validation.data;

    const result = await repo.getAdminReportsList({
      page,
      limit,
      status,
      reportType,
      search,
      sortBy,
      sortOrder,
    });

    return NextResponse.json({
      success: true,
      data: {
        items: result.items,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch reports";
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}