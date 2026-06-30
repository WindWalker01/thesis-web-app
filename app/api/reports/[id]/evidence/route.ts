// ============================================
// GET /api/reports/[id]/evidence - Get report evidence
// POST /api/reports/[id]/evidence - Upload evidence (with file)
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/server-utils";
import * as repo from "@/features/reports/server/reports-repository";
import * as service from "@/features/reports/server/reports-service";
import {
  MAX_EVIDENCE_FILE_SIZE,
  ALLOWED_EVIDENCE_MIME_TYPES,
} from "@/features/reports/schemas/report-schemas";

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

    const evidence = await repo.getReportEvidence(supabase, id);
    return NextResponse.json({ success: true, data: evidence });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch evidence";
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

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const description = formData.get("description") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "File is required" } },
        { status: 400 }
      );
    }

    // Validate file
    if (file.size > MAX_EVIDENCE_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "File must be under 10MB" },
        },
        { status: 400 }
      );
    }

    const allowedTypes = ALLOWED_EVIDENCE_MIME_TYPES as readonly string[];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Unsupported file type" },
        },
        { status: 400 }
      );
    }

    // Validate description
    if (description && description.length > 500) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Description must be at most 500 characters" },
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

    // Upload evidence
    const buffer = await file.arrayBuffer();
    const evidence = await service.uploadEvidence(supabase, {
      reportId: id,
      userId: user.id,
      fileName: file.name,
      mimeType: file.type,
      description,
      fileBuffer: buffer,
    });

    return NextResponse.json({ success: true, data: evidence }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload evidence";
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}