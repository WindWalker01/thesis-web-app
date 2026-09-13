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
  isAllowedFileType,
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

    // Step 1 of the browser-direct evidence upload: issue a signed Storage
    // upload ticket. JSON-only body — the raw file is PUT straight to
    // Supabase Storage by the client, so it never passes through this
    // function (serverless request-body cap rejects larger files).
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid request body" } },
        { status: 400 }
      );
    }

    const { fileName, mimeType, size } = body as {
      fileName?: unknown;
      mimeType?: unknown;
      size?: unknown;
    };

    if (typeof fileName !== "string" || fileName.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "File name is required" } },
        { status: 400 }
      );
    }

    if (typeof size !== "number" || !Number.isFinite(size) || size <= 0 || size > MAX_EVIDENCE_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "File must be under 10MB" },
        },
        { status: 400 }
      );
    }

    const mimeTypeString = typeof mimeType === "string" ? mimeType : "";
    if (!isAllowedFileType(mimeTypeString, fileName)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Unsupported file type" },
        },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const ticket = await service.createEvidenceUploadTicket(supabase, {
      reportId: id,
      userId: user.id,
      fileName,
      mimeType: mimeTypeString || null,
      size,
    });

    return NextResponse.json({ success: true, data: ticket }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to prepare the evidence upload";
    const status = message.includes("Not authorized")
      ? 403
      : message.includes("not found")
        ? 404
        : message.includes("final status")
          ? 409
          : 500;
    return NextResponse.json(
      { success: false, error: { code: "EVIDENCE_UPLOAD_ERROR", message } },
      { status }
    );
  }
}

export async function PUT(
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

    // Step 3 of the browser-direct evidence upload: record the metadata for
    // a file the client already PUT directly to Supabase Storage.
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid request body" } },
        { status: 400 }
      );
    }

    const { storagePath, fileName, mimeType, description } = body as {
      storagePath?: unknown;
      fileName?: unknown;
      mimeType?: unknown;
      description?: unknown;
    };

    // Path confinement: only paths issued for THIS report may be finalized.
    if (typeof storagePath !== "string" || !storagePath.startsWith(`reports/${id}/`)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid storage path" } },
        { status: 400 }
      );
    }

    if (typeof fileName !== "string" || fileName.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "File name is required" } },
        { status: 400 }
      );
    }

    const mimeTypeString = typeof mimeType === "string" ? mimeType : "";
    if (!isAllowedFileType(mimeTypeString, fileName)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Unsupported file type" },
        },
        { status: 400 }
      );
    }

    if (description !== null && description !== undefined) {
      if (typeof description !== "string" || description.length > 500) {
        return NextResponse.json(
          {
            success: false,
            error: { code: "VALIDATION_ERROR", message: "Description must be at most 500 characters" },
          },
          { status: 400 }
        );
      }
    }

    const supabase = await createSupabaseServerClient();

    const evidence = await service.finalizeEvidenceUpload(supabase, {
      reportId: id,
      userId: user.id,
      storagePath,
      fileName,
      mimeType: mimeTypeString || null,
      description: typeof description === "string" ? description : null,
    });

    return NextResponse.json({ success: true, data: evidence }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save evidence";
    const status = message.includes("Not authorized")
      ? 403
      : message.includes("not found")
        ? 404
        : message.includes("final status")
          ? 409
          : 500;
    return NextResponse.json(
      { success: false, error: { code: "EVIDENCE_UPLOAD_ERROR", message } },
      { status }
    );
  }
}