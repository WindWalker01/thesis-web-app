// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn(),
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { submitReviewEvidence } from "../submit-review-evidence";

const serverClientMock = createSupabaseServerClient as unknown as ReturnType<
  typeof vi.fn
>;
const adminClientMock = createSupabaseAdminClient as unknown as ReturnType<
  typeof vi.fn
>;

const REVIEW_ID = "review-1";

function makeReview(ownerId = "user-1") {
  return {
    id: REVIEW_ID,
    status: "needs_info",
    resubmission_count: 0,
    artwork_id: "artwork-1",
    artwork: { owner_id: ownerId, title: "Test Artwork" },
  };
}

function makeAdminSupabase(opts: { ownerId?: string } = {}) {
  const evidenceInserts: Array<Record<string, unknown>> = [];
  const reviewUpdates: Array<Record<string, unknown>> = [];
  const actionInserts: Array<Record<string, unknown>> = [];
  const notificationInserts: Array<unknown[]> = [];

  return {
    evidenceInserts,
    reviewUpdates,
    actionInserts,
    notificationInserts,
    client: {
      from: vi.fn((table: string) => {
        if (table === "artwork_reviews") {
          return {
            select: () => ({
              eq: () => ({
                single: () =>
                  Promise.resolve({ data: makeReview(opts.ownerId), error: null }),
              }),
            }),
            update: (row: Record<string, unknown>) => {
              reviewUpdates.push(row);
              return { eq: () => Promise.resolve({ error: null }) };
            },
          };
        }
        if (table === "users") {
          const chain: Record<string, unknown> = {};
          chain.select = () => chain;
          chain.eq = () => chain;
          chain.then = (fn: (v: unknown) => void) => {
            fn({ data: [{ id: "admin-1" }], error: null });
            return chain;
          };
          return chain;
        }
        if (table === "artwork_review_evidence") {
          return {
            insert: vi.fn((row: Record<string, unknown>) => {
              evidenceInserts.push(row);
              return Promise.resolve({ error: null });
            }),
          };
        }
        if (table === "artwork_review_actions") {
          return {
            insert: vi.fn((row: Record<string, unknown>) => {
              actionInserts.push(row);
              return Promise.resolve({ error: null });
            }),
          };
        }
        if (table === "notifications") {
          return {
            insert: vi.fn((rows: unknown[]) => {
              notificationInserts.push(rows);
              return Promise.resolve({ error: null });
            }),
          };
        }
        throw new Error(`Unexpected table: ${table}`);
      }),
    },
  };
}

function makeServerSupabase() {
  return {
    auth: {
      getUser: vi
        .fn()
        .mockResolvedValue({ data: { user: { id: "user-1" } }, error: null }),
    },
  };
}

function makeFormData(rawFiles: unknown) {
  const fd = new FormData();
  fd.append(
    "files",
    typeof rawFiles === "string" ? rawFiles : JSON.stringify(rawFiles),
  );
  return fd;
}

const FILES = [
  {
    publicId: "review-evidence/a",
    secureUrl:
      "https://res.cloudinary.com/test-cloud/auto/upload/v1/review-evidence/a",
    name: "shot.png",
    type: "image/png",
    size: 10,
  },
];

describe("submitReviewEvidence — browser-direct evidence metadata", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serverClientMock.mockResolvedValue(makeServerSupabase());
  });

  it("records metadata-only evidence and resets the review to pending", async () => {
    const ctx = makeAdminSupabase();
    adminClientMock.mockReturnValue(ctx.client);

    const result = await submitReviewEvidence(
      REVIEW_ID,
      "Fixed the crop",
      makeFormData(FILES),
    );

    expect(result.success).toBe(true);
    expect(ctx.evidenceInserts).toHaveLength(1);
    expect(ctx.evidenceInserts[0]).toMatchObject({
      review_id: REVIEW_ID,
      user_id: "user-1",
      message: "Fixed the crop",
      files: [
        { url: FILES[0].secureUrl, name: "shot.png", type: "image/png", size: 10 },
      ],
    });
    expect(ctx.reviewUpdates[0]).toMatchObject({
      status: "pending",
      resubmission_count: 1,
    });
    expect(ctx.actionInserts[0]).toMatchObject({ action: "evidence_submitted" });
    expect(ctx.notificationInserts).toHaveLength(1);
  });

  it("rejects malformed upload metadata before touching the database", async () => {
    const ctx = makeAdminSupabase();
    adminClientMock.mockReturnValue(ctx.client);

    const result = await submitReviewEvidence(
      REVIEW_ID,
      "",
      makeFormData("{not-json"),
    );

    expect(result.success).toBe(false);
    expect(ctx.evidenceInserts).toHaveLength(0);
    expect(ctx.reviewUpdates).toHaveLength(0);
  });

  it("refuses when the artwork is owned by someone else", async () => {
    const ctx = makeAdminSupabase({ ownerId: "someone-else" });
    adminClientMock.mockReturnValue(ctx.client);

    const result = await submitReviewEvidence(
      REVIEW_ID,
      "",
      makeFormData(FILES),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toMatch(/do not own/i);
    }
    expect(ctx.evidenceInserts).toHaveLength(0);
  });
});
