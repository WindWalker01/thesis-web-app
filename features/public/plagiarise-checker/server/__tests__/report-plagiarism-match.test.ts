import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireActiveAccount: vi.fn(),
  serverFrom: vi.fn(),
  adminFrom: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({ from: mocks.serverFrom })),
}));
vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn(() => ({ from: mocks.adminFrom })),
}));
vi.mock("@/lib/account-status", () => ({
  requireActiveAccount: mocks.requireActiveAccount,
}));
vi.mock("@/features/plagiarise-checker/server/resolve-db-artwork", () => ({
  isUuidLike: (v: unknown) => typeof v === "string" && v.length === 36,
}));

import { reportPlagiarismMatch } from "../report-plagiarism-match";

type Result = { data?: unknown; error?: unknown; onInsert?: (v: unknown) => void };

/** Chainable, thenable mock of a PostgREST query builder. */
function query(result: Result = {}) {
  const terminal = { data: result.data ?? null, error: result.error ?? null };
  const q: Record<string, unknown> = {
    then(resolve: (v: unknown) => void, reject: (e: unknown) => void) {
      return Promise.resolve(terminal).then(resolve, reject);
    },
    select: () => q,
    insert: (value: unknown) => {
      (result as { onInsert?: (v: unknown) => void }).onInsert?.(value);
      return q;
    },
    eq: () => q,
    order: () => q,
    limit: () => q,
    maybeSingle: async () => terminal,
    single: async () => terminal,
  };
  return q;
}

const ARTWORK_ID = "11111111-1111-4111-8111-111111111111";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.requireActiveAccount.mockResolvedValue("user-1");
  mocks.adminFrom.mockImplementation(() => query({ data: { id: "post-1" } }));
});

describe("reportPlagiarismMatch", () => {
  it("creates a copyright report linked to the matched artwork", async () => {
    const results: Result[] = [{ data: [] }, { data: { id: "report-1" } }];
    mocks.serverFrom.mockImplementation(() => query(results.shift() ?? {}));

    const result = await reportPlagiarismMatch({
      matchedArtworkId: ARTWORK_ID,
      matchedArtworkTitle: "Sunset",
      similarity: 92.5,
      source: "registered_arts",
      matchedUrl: "/community/post-1",
      originalHash: "0xabc",
      scanId: null,
      proof: "https://instagram.com/p/original",
      details: "I made this in 2023.",
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.reportId).toBe("report-1");
  });

  it("stores the reporter statement and detection data as structured metadata", async () => {
    let inserted: Record<string, unknown> | null = null;
    mocks.serverFrom.mockImplementation(() =>
      query({
        onInsert: (value) => {
          inserted = value as Record<string, unknown>;
        },
      })
    );

    await reportPlagiarismMatch({
      matchedArtworkId: ARTWORK_ID,
      matchedArtworkTitle: "Sunset",
      matchedArtworkImageUrl: "https://cdn.test/artwork.png",
      similarity: 92.5,
      source: "registered_arts",
      matchedUrl: "/community/post-1",
      originalHash: "0xabc",
      originalImageUrl: "https://cdn.test/uploaded.png",
      originalTitle: "my-original.png",
      scanId: null,
      proof: "This is my original work",
      details: "Published 2023",
    });

    const row = (inserted ?? {}) as {
      description: string;
      metadata: Record<string, unknown>;
      target_type: string;
      target_id: string;
    };

    // The description carries the reporter's own words, not a generated blob.
    expect(row.description).toContain("This is my original work");
    expect(row.description).toContain("Published 2023");
    expect(row.description).not.toContain("A potentially similar registered artwork");

    // Detection data stays structured for the admin plagiarism-report card.
    expect(row.metadata).toMatchObject({
      match_type: "internal",
      origin: "plagiarism_checker",
      similarity_percentage: 92.5,
      matched_artwork_image_url: "https://cdn.test/artwork.png",
      matched_url: "/community/post-1",
      original_hash: "0xabc",
      reporter_proof: "This is my original work",
      reporter_details: "Published 2023",
    });
    expect(row.target_type).toBe("artwork");
    expect(row.target_id).toBe(ARTWORK_ID);
  });

  it("stores the reporter's uploaded artwork so admins can see the reported copy", async () => {
    let inserted: Record<string, unknown> | null = null;
    mocks.serverFrom.mockImplementation(() =>
      query({
        onInsert: (value) => {
          inserted = value as Record<string, unknown>;
        },
      })
    );

    await reportPlagiarismMatch({
      matchedArtworkId: ARTWORK_ID,
      matchedArtworkTitle: "Sunset",
      similarity: 92.5,
      source: "registered_arts",
      matchedUrl: "/community/post-1",
      originalHash: "0xabc",
      originalImageUrl: "https://cdn.test/uploaded.png",
      originalTitle: "my-original.png",
      scanId: null,
      proof: "This is my original work",
    });

    const metadata = ((inserted ?? {}) as { metadata: Record<string, unknown> })
      .metadata;
    expect(metadata.original_artwork_url).toBe("https://cdn.test/uploaded.png");
    expect(metadata.original_artwork_title).toBe("my-original.png");
  });

  it("rejects a report with a non-URL original artwork reference", async () => {
    const result = await reportPlagiarismMatch({
      matchedArtworkId: ARTWORK_ID,
      matchedArtworkTitle: "Sunset",
      similarity: 92.5,
      source: "registered_arts",
      matchedUrl: null,
      originalHash: null,
      originalImageUrl: "not-a-url",
      scanId: null,
      proof: "My original",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toMatch(/original artwork url/i);
    }
  });

  it("rejects a report without the reporter's proof", async () => {
    const result = await reportPlagiarismMatch({
      matchedArtworkId: ARTWORK_ID,
      matchedArtworkTitle: "Sunset",
      similarity: 92.5,
      source: "registered_arts",
      matchedUrl: null,
      originalHash: null,
      scanId: null,
      proof: "   ",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toMatch(/original source|stolen/i);
    }
  });

  it("returns duplicate when the same reporter already reported the matched artwork", async () => {
    mocks.serverFrom.mockImplementation(() =>
      query({ data: [{ id: "existing", related_scan_id: null }] })
    );

    const result = await reportPlagiarismMatch({
      matchedArtworkId: ARTWORK_ID,
      matchedArtworkTitle: "Sunset",
      similarity: 92.5,
      source: "registered_arts",
      matchedUrl: null,
      originalHash: null,
      scanId: null,
      proof: "My original",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.duplicate).toBe(true);
      expect(result.existingReportId).toBe("existing");
    }
  });

  it("fails gracefully when the user is not authenticated", async () => {
    mocks.requireActiveAccount.mockRejectedValue(
      new Error("You need to sign in to submit a report.")
    );

    const result = await reportPlagiarismMatch({
      matchedArtworkId: ARTWORK_ID,
      matchedArtworkTitle: null,
      similarity: 90,
      source: "registered_arts",
      matchedUrl: null,
      originalHash: null,
      scanId: null,
      proof: "My original",
    });

    expect(result.success).toBe(false);
  });
});

