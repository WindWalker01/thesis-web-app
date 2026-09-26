// @vitest-environment node
//
// Tests for the two-step signed evidence upload service functions
// (createEvidenceUploadTicket + finalizeEvidenceUpload) that replace raw-file
// uploads through the route handler, which serverless request-body caps
// reject for larger files.
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn(),
}));

vi.mock("../reports-repository", () => ({
  getReportById: vi.fn(),
  insertReportEvidence: vi.fn(),
  insertReportAction: vi.fn(),
}));

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import * as service from "../reports-service";
import * as repo from "../reports-repository";

const getAdminClientMock = createSupabaseAdminClient as unknown as ReturnType<
  typeof vi.fn
>;

let sessionRole = "user";

function makeSupabase() {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      }),
    },
    from: vi.fn((table: string) => {
      if (table === "users") {
        const chain = {
          select: () => chain,
          eq: () => chain,
          single: () =>
            Promise.resolve({ data: { role: sessionRole }, error: null }),
        };
        return chain;
      }
      if (table === "notifications") {
        return { insert: vi.fn().mockResolvedValue({ error: null }) };
      }
      throw new Error(`Unexpected table: ${table}`);
    }),
  } as never;
}

function makeAdminClient() {
  return {
    storage: {
      from: vi.fn(() => ({
        getPublicUrl: vi.fn(() => ({
          data: {
            publicUrl: "https://storage.example.com/report-1/evidence.png",
          },
        })),
        createSignedUploadUrl: vi.fn().mockResolvedValue({
          data: {
            signedUrl: "https://storage.example.com/upload-url",
            path: "reports/report-1/1_proof.png",
            token: "token-1",
          },
          error: null,
        }),
      })),
    },
  };
}

const OWNED_REPORT = {
  id: "report-1",
  reporter_id: "user-1",
  reported_art_post_id: "art-post-1",
  report_type: "copyright",
  title: "Test Report",
  description: "Test description for a copyright report.",
  status: "under_review",
  created_at: "2026-01-01T00:00:00Z",
  resolved_at: null,
} as const;

const evidenceRow = {
  id: "evidence-1",
  report_id: "report-1",
  uploaded_by: "user-1",
  file_url: "https://storage.example.com/report-1/evidence.png",
  file_name: "proof.png",
  mime_type: "image/png",
  description: null,
  created_at: "2026-01-01T00:00:00Z",
};

beforeEach(() => {
  sessionRole = "user";
  vi.clearAllMocks();
  getAdminClientMock.mockReset();
  getAdminClientMock.mockImplementation(() => makeAdminClient());
  vi.mocked(repo.getReportById).mockResolvedValue(OWNED_REPORT);
  vi.mocked(repo.insertReportEvidence).mockResolvedValue(evidenceRow);
  vi.mocked(repo.insertReportAction).mockResolvedValue({
    id: "action-1",
    report_id: "report-1",
    admin_id: "user-1",
    action: "evidence_uploaded",
    previous_status: null,
    new_status: null,
    notes: "Uploaded: proof.png",
    created_at: "2026-01-01T00:00:00Z",
  });
});

describe("signed evidence upload (ticket + finalize)", () => {
  it("issues a storage upload ticket without inserting evidence", async () => {
    const supabase = makeSupabase();

    const ticket = await service.createEvidenceUploadTicket(supabase, {
      reportId: "report-1",
      userId: "user-1",
      fileName: "proof.png",
      mimeType: "image/png",
      size: 8,
    });

    expect(ticket.storagePath).toBe("reports/report-1/1_proof.png");
    expect(ticket.token).toBe("token-1");
    expect(repo.insertReportEvidence).not.toHaveBeenCalled();
    expect(repo.insertReportAction).not.toHaveBeenCalled();
  });

  it("finalizes evidence from an uploaded storage path and records the reporter audit entry", async () => {
    const supabase = makeSupabase();

    const evidence = await service.finalizeEvidenceUpload(supabase, {
      reportId: "report-1",
      userId: "user-1",
      storagePath: "reports/report-1/1_proof.png",
      fileName: "proof.png",
      mimeType: "image/png",
      description: "Screenshot",
    });

    expect(evidence.id).toBe("evidence-1");
    expect(repo.insertReportEvidence).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({
        report_id: "report-1",
        uploaded_by: "user-1",
        file_url: "https://storage.example.com/report-1/evidence.png",
        file_name: "proof.png",
      }),
    );
    // Self-attribution enforced by RLS policy "Reporters can record
    // evidence on own reports".
    expect(repo.insertReportAction).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({
        admin_id: "user-1",
        action: "evidence_uploaded",
      }),
    );
  });

  it("refuses a ticket for a non-owner non-admin uploader", async () => {
    vi.mocked(repo.getReportById).mockResolvedValueOnce({
      ...OWNED_REPORT,
      reporter_id: "other-user",
    } as never);

    await expect(
      service.createEvidenceUploadTicket(makeSupabase(), {
        reportId: "report-1",
        userId: "user-1",
        fileName: "proof.png",
        mimeType: "image/png",
        size: 8,
      }),
    ).rejects.toThrow("Not authorized to upload evidence to this report");

    expect(repo.insertReportEvidence).not.toHaveBeenCalled();
  });
});
