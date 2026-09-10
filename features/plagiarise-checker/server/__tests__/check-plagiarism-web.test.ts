import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkPlagiarismWeb } from "../check-plagiarism-web";
import type { PlagiarismWebResult, OtherSearchMatch } from "../../types";

// We need to mock the supabase module before importing the server action
// Use a mutable object to hold our mock implementation
const mockSupabaseResponse = {
  data: null,
  error: null,
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

function makeOtherMatch(overrides: Partial<OtherSearchMatch> = {}): OtherSearchMatch {
  return {
    source: "Test Source",
    link: "https://example.com/source",
    url: "https://example.com/image.jpg",
    similarity: 0,
    ...overrides,
  };
}

describe("checkPlagiarismWeb - other_matches enrichment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("preserves original link for database matches while updating url with Cloudinary imageUrl", async () => {
    // Mock successful DB lookup
    mockSupabaseResponse.data = {
      id: "3213a9dc-ff10-40f2-8a1e-17017d1b40cb",
      title: "Test Artwork",
      c_secure_url: "https://cloudinary.com/artwork123.jpg",
    };
    mockSupabaseResponse.error = null;

    const mockApiResponse: PlagiarismWebResult = {
      filename: "test.jpg",
      success: true,
      original_hash: "abc123",
      hashes: { transforms: {}, blocks: {} },
      other_matches: [
        makeOtherMatch({
          artwork_id: "3213a9dc-ff10-40f2-8a1e-17017d1b40cb",
          link: "https://marketplace.com/artwork/123",
          url: "https://marketplace.com/images/artwork123.jpg",
        }),
      ],
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    });
    vi.stubGlobal("fetch", mockFetch);

    const formData = new FormData();
    formData.append("file", new File([new ArrayBuffer(10)], "test.jpg", { type: "image/jpeg" }));

    const result = await checkPlagiarismWeb(null, formData);

    expect(result.success).toBe(true);
    expect(result.data?.other_matches).toHaveLength(1);

    const enrichedMatch = result.data!.other_matches[0];
    // url should be Cloudinary image URL for display
    expect(enrichedMatch.url).toBe("https://cloudinary.com/artwork123.jpg");
    // link should preserve original source link (not Cloudinary URL)
    expect(enrichedMatch.link).toBe("https://marketplace.com/artwork/123");
  });
});