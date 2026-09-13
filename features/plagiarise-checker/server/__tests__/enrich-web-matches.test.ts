import { beforeEach, describe, expect, it, vi } from "vitest";

import { enrichWebMatches } from "../enrich-web-matches";
import type { OtherSearchMatch, SearchResponse } from "../../types";

type MockDbRow = {
  id: string;
  title: string;
  c_secure_url: string | null;
  status?: string;
  license_name?: string;
  created_at?: string;
  owner?: { username?: string; first_name?: string; last_name?: string } | null;
};

// Mutable mock state, one entry per queried table.
const mockDbResponse = {
  data: null as MockDbRow | null,
  error: null as unknown,
};
const mockPostResponse = {
  data: null as { id: string } | null,
  error: null as unknown,
};

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => ({
    from: (table: string) => {
      if (table === "art_posts") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({
                  order: () => ({
                    limit: () => ({
                      maybeSingle: async () => ({
                        data: mockPostResponse.data,
                        error: mockPostResponse.error,
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: mockDbResponse.data,
              error: mockDbResponse.error,
            }),
          }),
        }),
      };
    },
  }),
}));

const DB_UUID = "3213a9dc-ff10-40f2-8a1e-17017d1b40cb";
const POST_ID = "5f0c2b1a-1111-4222-8333-444455556666";

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

function makeDbRow(overrides: Partial<MockDbRow> = {}): MockDbRow {
  return {
    id: DB_UUID,
    title: "Test Artwork",
    c_secure_url: "https://cloudinary.com/artwork123.jpg",
    status: "verified",
    license_name: "All Rights Reserved",
    created_at: "2026-01-15T10:30:00Z",
    owner: { username: "jdoe", first_name: "Jane", last_name: "Doe" },
    ...overrides,
  };
}

function makeDbResult(): SearchResponse {
  return makeResult({
    db: { type: "database", source: "registry", url: DB_UUID, link: DB_UUID, similarity: 99 },
    best_match: { type: "database", source: "registry", url: DB_UUID, link: DB_UUID, similarity: 99 },
  });
}

describe("enrichWebMatches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDbResponse.data = null;
    mockDbResponse.error = null;
    mockPostResponse.data = null;
    mockPostResponse.error = null;
  });

  it("preserves original link for database matches while updating url with Cloudinary imageUrl", async () => {
    mockDbResponse.data = makeDbRow();

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
    mockDbResponse.data = makeDbRow();

    const result = await enrichWebMatches(makeDbResult());

    expect(result.db?.imageUrl).toBe("https://cloudinary.com/artwork123.jpg");
    expect(result.db?.title).toBe("Test Artwork");
    expect(result.best_match?.imageUrl).toBe("https://cloudinary.com/artwork123.jpg");
    expect(result.best_match?.title).toBe("Test Artwork");
  });

  it("resolves author, registration date, status and license onto db and best_match", async () => {
    mockDbResponse.data = makeDbRow();

    const result = await enrichWebMatches(makeDbResult());

    const expected = {
      authorName: "Jane Doe",
      registeredAt: "2026-01-15T10:30:00Z",
      status: "verified",
      licenseName: "All Rights Reserved",
    };
    expect(result.db).toMatchObject(expected);
    expect(result.best_match).toMatchObject(expected);
  });

  it("resolves the community post URL when the artwork is publicly published", async () => {
    mockDbResponse.data = makeDbRow();
    mockPostResponse.data = { id: POST_ID };

    const result = await enrichWebMatches(makeDbResult());

    expect(result.db?.communityUrl).toBe(`/community/${POST_ID}`);
    expect(result.best_match?.communityUrl).toBe(`/community/${POST_ID}`);
  });

  it("leaves communityUrl null when the artwork has no public community post", async () => {
    mockDbResponse.data = makeDbRow();
    mockPostResponse.data = null;

    const result = await enrichWebMatches(makeDbResult());

    expect(result.db?.communityUrl).toBeNull();
    expect(result.best_match?.communityUrl).toBeNull();
  });

  it("falls back to username when the owner has no full name", async () => {
    mockDbResponse.data = makeDbRow({ owner: { username: "jdoe" } });

    const result = await enrichWebMatches(makeDbResult());

    expect(result.db?.authorName).toBe("jdoe");
  });

  it("tolerates missing artwork rows (no enrichment applied)", async () => {
    mockDbResponse.data = null;

    const result = await enrichWebMatches(makeDbResult());

    expect(result.db?.imageUrl).toBeUndefined();
    expect(result.db?.title).toBeUndefined();
    expect(result.db?.authorName).toBeUndefined();
    expect(result.db?.communityUrl).toBeUndefined();
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
