import { beforeEach, describe, expect, it, vi } from "vitest";

import { enrichWebMatches } from "../enrich-web-matches";
import type { OtherSearchMatch, SearchResponse } from "../../types";

// We need to mock the supabase module before importing the server action
// Use a mutable object to hold our mock implementation
const mockSupabaseResponse = {
  data: null as
    | { id: string; title: string; c_secure_url: string | null }
    | null,
  error: null as unknown,
};

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => {
            return { data: mockSupabaseResponse.data, error: mockSupabaseResponse.error };
          },
        }),
      }),
    }),
  }),
}));

const DB_UUID = "3213a9dc-ff10-40f2-8a1e-17017d1b40cb";

function makeOtherMatch(overrides: Partial<OtherSearchMatch> = {}): OtherSearchMatch {
  return {
    source: "Test Source",
    link: "https://example.com/source",
    url: "https://example.com/image.jpg",
    similarity: 0,
    ...overrides,
  };
}

function makeResult(overrides: Partial<SearchResponse> = {}): SearchResponse {
  return {
    filename: "test.jpg",
    success: true,
    original_hash: "abc123",
    hashes: { transforms: {}, blocks: {} },
    other_matches: [],
    ...overrides,
  };
}

describe("enrichWebMatches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseResponse.data = null;
    mockSupabaseResponse.error = null;
  });

  it("preserves original link for database matches while updating url with Cloudinary imageUrl", async () => {
    mockSupabaseResponse.data = {
      id: DB_UUID,
      title: "Test Artwork",
      c_secure_url: "https://cloudinary.com/artwork123.jpg",
    };

    const result = await enrichWebMatches(
      makeResult({
        other_matches: [
          makeOtherMatch({
            artwork_id: DB_UUID,
            link: "https://marketplace.com/artwork/123",
            url: "https://marketplace.com/images/artwork123.jpg",
          }),
        ],
      }),
    );

    expect(result.other_matches).toHaveLength(1);
    // url should be Cloudinary image URL for display
    expect(result.other_matches[0].url).toBe("https://cloudinary.com/artwork123.jpg");
    // link should preserve original source link (not Cloudinary URL)
    expect(result.other_matches[0].link).toBe("https://marketplace.com/artwork/123");
  });

  it("resolves db and best_match metadata when db.url is a database UUID", async () => {
    mockSupabaseResponse.data = {
      id: DB_UUID,
      title: "Test Artwork",
      c_secure_url: "https://cloudinary.com/artwork123.jpg",
    };

    const result = await enrichWebMatches(
      makeResult({
        db: {
          type: "database",
          source: "registry",
          url: DB_UUID,
          link: DB_UUID,
          similarity: 99,
        },
        best_match: {
          type: "database",
          source: "registry",
          url: DB_UUID,
          link: DB_UUID,
          similarity: 99,
        },
      }),
    );

    expect(result.db?.imageUrl).toBe("https://cloudinary.com/artwork123.jpg");
    expect(result.db?.title).toBe("Test Artwork");
    expect(result.best_match?.imageUrl).toBe("https://cloudinary.com/artwork123.jpg");
    expect(result.best_match?.title).toBe("Test Artwork");
  });

  it("leaves non-UUID db.url untouched and passes web diagnostics through", async () => {
    const result = await enrichWebMatches(
      makeResult({
        db: {
          type: "database",
          source: "registry",
          url: "https://example.com/not-a-uuid.jpg",
          similarity: 1,
        },
        web_warning: "Online check skipped...",
        web_diagnostics: {
          status: "degraded",
          cloudinary_ready: false,
          readiness_status: 404,
          error: "cloudinary_url_not_ready",
        },
      }),
    );

    expect(result.db?.imageUrl).toBeUndefined();
    expect(result.db?.title).toBeUndefined();
    expect(result.web_warning).toBe("Online check skipped...");
    expect(result.web_diagnostics?.status).toBe("degraded");
  });

  it("tolerates legacy responses without web_warning/web_diagnostics (pass-through)", async () => {
    const result = await enrichWebMatches(makeResult());

    expect(result.web_warning).toBeUndefined();
    expect(result.web_diagnostics).toBeUndefined();
  });
});
