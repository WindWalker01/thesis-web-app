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

type Result = { data?: unknown; error?: unknown };

/** Chainable, thenable mock of a PostgREST query builder. */
function query(result: Result = {}) {
  const terminal = { data: result.data ?? null, error: result.error ?? null };
  const q: Record<string, unknown> = {
    then(resolve: (v: unknown) => void, reject: (e: unknown) => void) {
      return Promise.resolve(terminal).then(resolve, reject);
    },
    select: () => q,
    insert: () => q,
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
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.reportId).toBe("report-1");
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
    });

    expect(result.success).toBe(false);
  });
});

