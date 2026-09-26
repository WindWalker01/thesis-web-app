import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireActiveAccount: vi.fn(),
  adminFrom: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn(() => ({ from: mocks.adminFrom })),
}));
vi.mock("@/lib/account-status", () => ({
  requireActiveAccount: mocks.requireActiveAccount,
}));

import { requestPlagiarismManualReview } from "../request-plagiarism-manual-review";

type Result = { data?: unknown; error?: unknown };

function query(result: Result = {}) {
  const terminal = { data: result.data ?? null, error: result.error ?? null };
  const q: Record<string, unknown> = {
    then(resolve: (v: unknown) => void, reject: (e: unknown) => void) {
      return Promise.resolve(terminal).then(resolve, reject);
    },
    select: () => q,
    insert: () => q,
    update: () => q,
    eq: () => q,
    maybeSingle: async () => terminal,
    single: async () => terminal,
  };
  return q;
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.requireActiveAccount.mockResolvedValue("user-1");
});

describe("requestPlagiarismManualReview", () => {
  it("creates an external review request for a public-page match", async () => {
    mocks.adminFrom
      .mockImplementationOnce(() => query({ data: [] })) // duplicate check
      .mockImplementationOnce(() => query({ data: { id: "review-1" } })); // insert

    const result = await requestPlagiarismManualReview({
      externalUrl: "https://example.com/art.png",
      externalSource: "Google Images",
      similarity: 78,
      originalHash: "0xabc",
      originalTitle: "my-art.png",
      originalImageUrl: "https://res.cloudinary.com/x/image/upload/review.png",
      scanId: null,
      artworkId: null,
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.reviewId).toBe("review-1");
  });

  it("returns duplicate for an already-submitted external request", async () => {
    mocks.adminFrom.mockImplementationOnce(() =>
      query({ data: [{ id: "existing", related_scan_id: null }] })
    );

    const result = await requestPlagiarismManualReview({
      externalUrl: "https://example.com/art.png",
      externalSource: "Google Images",
      similarity: 78,
      originalHash: null,
      originalTitle: null,
      originalImageUrl: null,
      scanId: null,
      artworkId: null,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.duplicate).toBe(true);
      expect(result.existingReviewId).toBe("existing");
    }
  });

  it("reuses the existing review for the registration flow", async () => {
    mocks.adminFrom
      .mockImplementationOnce(() =>
        query({
          data: {
            id: "review-existing",
            review_source: "registration",
            external_url: null,
          },
        })
      )
      .mockImplementationOnce(() => query({})); // enrichment update

    const result = await requestPlagiarismManualReview({
      externalUrl: "https://example.com/art.png",
      externalSource: "Google Images",
      similarity: 81,
      originalHash: null,
      originalTitle: null,
      originalImageUrl: null,
      scanId: null,
      artworkId: "11111111-1111-4111-8111-111111111111",
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.reviewId).toBe("review-existing");
  });

  it("fails gracefully when the user is not authenticated", async () => {
    mocks.requireActiveAccount.mockRejectedValue(
      new Error("You need to sign in to request a manual review.")
    );

    const result = await requestPlagiarismManualReview({
      externalUrl: "https://example.com/art.png",
      externalSource: null,
      similarity: 78,
      originalHash: null,
      originalTitle: null,
      originalImageUrl: null,
      scanId: null,
      artworkId: null,
    });

    expect(result.success).toBe(false);
  });
});

