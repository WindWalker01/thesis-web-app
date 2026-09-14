import { beforeEach, describe, expect, it, vi } from "vitest";

const mockArtwork = {
  id: "11111111-1111-4111-8111-111111111111",
  owner_id: "user-123",
  title: "Ethereal Sunrise",
  c_secure_url: "https://example.com/art.png",
  perceptual_hash: "0x123456789abcdef",
  work_id: "42",
  created_at: "2026-09-01T12:00:00Z",
  status: "active",
  chain: "amoy",
  tx_hash: "0xabcdef1234567890",
  license_identifier: "cc-by",
};

let currentArtwork: typeof mockArtwork | null = mockArtwork;

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === "registered_arts") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(async () => ({
                data: currentArtwork,
                error: null,
              })),
            })),
          })),
        };
      }
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({
              data: null,
              error: null,
            })),
          })),
        })),
      };
    }),
  })),
}));

vi.mock("@/lib/server-utils", () => ({
  getAuthUser: vi.fn(async () => null),
}));

vi.mock("./read-onchain-work", () => ({
  readOnChainWork: vi.fn(async () => ({
    pHash: "0x123456789abcdef",
    revoked: false,
    revokedAt: null,
    createdAt: 1700000000,
  })),
}));

import { verifyCertificate } from "./verify-certificate";

describe("verifyCertificate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentArtwork = { ...mockArtwork };
  });

  it("returns invalid_id when rawId is not a UUID", async () => {
    const result = await verifyCertificate("not-a-uuid");
    expect(result).toEqual({ found: false, reason: "invalid_id" });
  });

  it("returns not_found when artwork does not exist", async () => {
    currentArtwork = null;
    const result = await verifyCertificate("11111111-1111-4111-8111-111111111111");
    expect(result).toEqual({ found: false, reason: "not_found" });
  });

  it("resolves and includes Creative Commons license details in public payload", async () => {
    currentArtwork = {
      ...mockArtwork,
      license_identifier: "cc-by",
    };

    const result = await verifyCertificate("11111111-1111-4111-8111-111111111111");
    expect(result.found).toBe(true);

    if (result.found) {
      expect(result.data.license).toBeDefined();
      expect(result.data.license.identifier).toBe("cc-by");
      expect(result.data.license.shortHandle).toBe("CC BY 4.0");
      expect(result.data.license.url).toBe("https://creativecommons.org/licenses/by/4.0/");
      expect(result.data.license.name).toContain("Creative Commons Attribution");
    }
  });

  it("falls back to all-rights-reserved when license_identifier is null or empty", async () => {
    currentArtwork = {
      ...mockArtwork,
      license_identifier: null,
    };

    const result = await verifyCertificate("11111111-1111-4111-8111-111111111111");
    expect(result.found).toBe(true);

    if (result.found) {
      expect(result.data.license).toBeDefined();
      expect(result.data.license.identifier).toBe("all-rights-reserved");
      expect(result.data.license.shortHandle).toBe("All Rights Reserved");
      expect(result.data.license.url).toBeNull();
    }
  });
});
