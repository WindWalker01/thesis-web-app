import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn(),
}));

vi.mock("../reports-repository", () => ({
  getReportById: vi.fn(),
  updateReportStatus: vi.fn(),
  assignAdminToReport: vi.fn(),
  getReportAssignedAdmin: vi.fn(),
  insertReportComment: vi.fn(),
  insertReportEvidence: vi.fn(),
  insertReportAction: vi.fn(),
  insertReportDecision: vi.fn(),
}));

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import * as service from "../reports-service";
import * as repo from "../reports-repository";

const getAdminClientMock = createSupabaseAdminClient as unknown as ReturnType<
  typeof vi.fn
>;

let sessionRole = "user";

/** Minimal session client: role lookup, admin list, notifications. */
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
        let lastSelect = "";
        const chain = {
          select: (cols: string) => {
            lastSelect = cols;
            return chain;
          },
          eq: () => chain,
          single: () =>
            Promise.resolve({
              data:
                lastSelect === "id"
                  ? [{ id: "admin-1" }, { id: "admin-2" }]
                  : { role: sessionRole },
              error: null,
            }),
          then: (fn: (v: unknown) => void) => {
            fn({
              data:
                lastSelect === "id"
                  ? [{ id: "admin-1" }, { id: "admin-2" }]
                  : { role: sessionRole },
              error: null,
            });
            return chain;
          },
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
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn(() => ({
          data: {
            publicUrl: "https://storage.example.com/report-1/evidence.png",
          },
        })),
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

const buffer = new ArrayBuffer(8);

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

describe("uploadEvidence (user-side reporter flow)", () => {
  it("records evidence + self-attributed evidence_uploaded action for a non-admin reporter", async () => {
    const supabase = makeSupabase();

    const evidence = await service.uploadEvidence(supabase, {
      reportId: "report-1",
      userId: "user-1",
      fileName: "proof.png",
      mimeType: "image/png",
      description: "Screenshot",
      fileBuffer: buffer,
    });

    expect(evidence.file_name).toBe("proof.png");

    expect(repo.insertReportEvidence).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({
        report_id: "report-1",
        uploaded_by: "user-1",
        file_name: "proof.png",
      }),
    );

    // Self-attribution enforced by RLS policy "Reporters can record
    // evidence on own reports".
    expect(repo.insertReportAction).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({
        report_id: "report-1",
        admin_id: "user-1",
        action: "evidence_uploaded",
        previous_status: null,
        new_status: null,
        notes: "Uploaded: proof.png",
      }),
    );
  });

  it("throws Not authorized when a non-owner non-admin user attempts upload", async () => {
    vi.mocked(repo.getReportById).mockResolvedValueOnce({
      ...OWNED_REPORT,
      reporter_id: "other-user",
    });
    const supabase = makeSupabase();

    await expect(
      service.uploadEvidence(supabase, {
        reportId: "report-1",
        userId: "user-1",
        fileName: "proof.png",
        mimeType: "image/png",
        description: null,
        fileBuffer: buffer,
      }),
    ).rejects.toThrow("Not authorized to upload evidence to this report");

    expect(repo.insertReportEvidence).not.toHaveBeenCalled();
    expect(repo.insertReportAction).not.toHaveBeenCalled();
  });

  it("does not create a reporter audit entry when an admin uploads evidence", async () => {
    sessionRole = "admin";
    const supabase = makeSupabase();

    const evidence = await service.uploadEvidence(supabase, {
      reportId: "report-1",
      userId: "user-1",
      fileName: "admin-evidence.pdf",
      mimeType: "application/pdf",
      description: null,
      fileBuffer: buffer,
    });

    expect(evidence).toBeDefined();
    expect(repo.insertReportAction).not.toHaveBeenCalled();
    expect(repo.insertReportEvidence).toHaveBeenCalledTimes(1);
  });

  it("rejects evidence upload when the report has a terminal status", async () => {
    vi.mocked(repo.getReportById).mockResolvedValueOnce({
      ...OWNED_REPORT,
      status: "resolved",
      resolved_at: "2026-01-02T00:00:00Z",
    });
    const supabase = makeSupabase();

    await expect(
      service.uploadEvidence(supabase, {
        reportId: "report-1",
        userId: "user-1",
        fileName: "proof.png",
        mimeType: "image/png",
        description: null,
        fileBuffer: buffer,
      }),
    ).rejects.toThrow("Cannot upload evidence to a report with a final status");

    expect(repo.insertReportEvidence).not.toHaveBeenCalled();
    expect(repo.insertReportAction).not.toHaveBeenCalled();
  });
});

describe("admin-originated audit actions (RLS regression: admin flows still work)", () => {
  it("updateReportStatusWithAudit records a status_change with the admin id", async () => {
    vi.mocked(repo.insertReportAction).mockResolvedValueOnce({
      id: "action-1",
      report_id: "report-1",
      admin_id: "admin-1",
      action: "status_change",
      previous_status: "under_review",
      new_status: "resolved",
      notes: null,
      created_at: "2026-01-01T00:00:00Z",
    });
    const supabase = makeSupabase();

    const res = await service.updateReportStatusWithAudit(supabase, {
      reportId: "report-1",
      newStatus: "resolved",
      adminId: "admin-1",
    });

    expect(res.action.action).toBe("status_change");
    expect(res.action.admin_id).toBe("admin-1");
    expect(repo.insertReportAction).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({
        report_id: "report-1",
        admin_id: "admin-1",
        action: "status_change",
      }),
    );
  });

  it("requestEvidenceWithAudit records an evidence_requested action with the admin id", async () => {
    vi.mocked(repo.insertReportComment).mockResolvedValueOnce({
      id: "comment-1",
      report_id: "report-1",
      user_id: "admin-1",
      message: "Please upload clearer evidence.",
      is_admin: true,
      created_at: "2026-01-01T00:00:00Z",
      read_at: null,
      file_url: null,
      file_name: null,
      mime_type: null,
      message_type: "text",
      parent_id: null,
    });
    vi.mocked(repo.insertReportAction).mockResolvedValueOnce({
      id: "action-1",
      report_id: "report-1",
      admin_id: "admin-1",
      action: "evidence_requested",
      previous_status: "under_review",
      new_status: "under_review",
      notes: "Please upload clearer evidence.",
      created_at: "2026-01-01T00:00:00Z",
    });
    const supabase = makeSupabase();

    const res = await service.requestEvidenceWithAudit(supabase, {
      reportId: "report-1",
      adminId: "admin-1",
      message: "Please upload clearer evidence.",
    });

    expect(res.action.action).toBe("evidence_requested");
    expect(repo.insertReportAction).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({
        report_id: "report-1",
        admin_id: "admin-1",
        action: "evidence_requested",
      }),
    );
  });

  it("self-attribution contract: reporter action insert carries reporter's own id", async () => {
    sessionRole = "user";
    const supabase = makeSupabase();

    await service.uploadEvidence(supabase, {
      reportId: "report-1",
      userId: "user-1",
      fileName: "proof.png",
      mimeType: "image/png",
      description: null,
      fileBuffer: buffer,
    });

    // Insert goes through session client (auth.uid() RLS), self-attributed.
    expect(repo.insertReportAction).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({
        admin_id: "user-1",
        action: "evidence_uploaded",
      }),
    );
    // Admin (service-role) client used for storage only.
    expect(getAdminClientMock).toHaveBeenCalledTimes(1);
  });
});
