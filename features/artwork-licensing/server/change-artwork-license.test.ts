import { beforeEach, describe, expect, it, vi } from "vitest";

type FakeResult = {
  updatePayload?: Record<string, unknown>;
  historyInsert?: Record<string, unknown>;
  selectedArtwork?: {
    id: string;
    owner_id: string;
    license_identifier: string | null;
  } | null;
};

function makeFakeChain(result: FakeResult) {
  const calls: string[] = [];
  const state: FakeResult = { ...result };

  return {
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: { id: "user-1" } },
        error: null,
      })),
    },
    from: vi.fn((table: string) => {
      calls.push(`from:${table}`);

      if (table === "registered_arts") {
        const select = vi.fn(() => {
          calls.push("select");
          const eq = vi.fn(() => {
            calls.push("eq");
            const eq2 = vi.fn(() => ({
              maybeSingle: vi.fn(async () => ({
                data: state.selectedArtwork ?? null,
                error: null,
              })),
            }));
            return { eq: eq2 };
          });
          return { eq };
        });

        const update = vi.fn((payload: Record<string, unknown>) => {
          calls.push("update");
          state.updatePayload = payload;
          const eq = vi.fn(() => {
            calls.push("eq");
            const eq2 = vi.fn(async () => ({
              data: null,
              error: null,
            }));
            return { eq: eq2 };
          });
          return { eq };
        });

        return { select, update };
      }

      if (table === "artwork_license_history") {
        const insert = vi.fn(async (payload: Record<string, unknown>) => {
          calls.push("insert");
          state.historyInsert = payload;
          return { data: null, error: null };
        });
        return { insert };
      }

      return {};
    }),
    calls,
    get updatePayload() {
      return state.updatePayload;
    },
    get historyInsert() {
      return state.historyInsert;
    },
  };
}

beforeEach(() => {
  vi.resetModules();
});

describe("changeArtworkLicense", () => {
  it("returns unauthorized when the user is not authenticated", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createSupabaseServerClient: async () => ({
        auth: { getUser: async () => ({ data: { user: null }, error: null }) },
        from: vi.fn(),
      }),
    }));

    const { changeArtworkLicense: action } = await import(
      "./change-artwork-license"
    );
    const result = await action("art-1", "cc-by");
    expect(result.success).toBe(false);
    if (!result.success) expect(result.message).toMatch(/authenticated/i);
  });

  it("rejects an invalid license identifier without touching the DB", async () => {
    const fake = makeFakeChain({});
    vi.doMock("@/lib/supabase/server", () => ({
      createSupabaseServerClient: async () => fake,
    }));
    const { changeArtworkLicense: action } = await import(
      "./change-artwork-license"
    );

    const result = await action("art-1", "cc-by-bogus");

    expect(result.success).toBe(false);
    expect(fake.from).not.toHaveBeenCalled();
  });

  it("rejects when the artwork is not owned by the current user", async () => {
    // no row returned due to the ownership filter
    const fake = makeFakeChain({ selectedArtwork: null });
    vi.doMock("@/lib/supabase/server", () => ({
      createSupabaseServerClient: async () => fake,
    }));
    const { changeArtworkLicense: action } = await import(
      "./change-artwork-license"
    );

    const result = await action("art-9", "cc-by");

    expect(result.success).toBe(false);
    if (!result.success) expect(result.message).toMatch(/not found/i);
    // Only the ownership-scoped select ran; no update or history write.
    expect(fake.calls.some((c) => c === "update")).toBe(false);
  });

  it("persists the license change and records history for the owner", async () => {
    const fake = makeFakeChain({
      selectedArtwork: {
        id: "art-1",
        owner_id: "user-1",
        license_identifier: "all-rights-reserved",
      },
    });
    vi.doMock("@/lib/supabase/server", () => ({
      createSupabaseServerClient: async () => fake,
    }));
    const { changeArtworkLicense: action } = await import(
      "./change-artwork-license"
    );

    const result = await action("art-1", "cc-by-nc");

    expect(result.success).toBe(true);
    expect(fake.calls).toContain("update");
    expect(fake.calls).toContain("insert");

    expect(fake.updatePayload).toEqual(
      expect.objectContaining({
        license_identifier: "cc-by-nc",
        license_name: expect.stringContaining("NonCommercial"),
        license_url: expect.stringContaining("by-nc"),
        license_type: "creative_commons",
      }),
    );

    expect(fake.historyInsert).toEqual(
      expect.objectContaining({
        artwork_id: "art-1",
        previous_license: "all-rights-reserved",
        new_license: "cc-by-nc",
        changed_by: "user-1",
      }),
    );
  });

  it("is a no-op when the license is unchanged", async () => {
    const fake = makeFakeChain({
      selectedArtwork: {
        id: "art-1",
        owner_id: "user-1",
        license_identifier: "cc-by",
      },
    });
    vi.doMock("@/lib/supabase/server", () => ({
      createSupabaseServerClient: async () => fake,
    }));
    const { changeArtworkLicense: action } = await import(
      "./change-artwork-license"
    );

    const result = await action("art-1", "cc-by");

    expect(result.success).toBe(true);
    if (result.success) expect(result.message).toMatch(/unchanged/i);
    expect(fake.calls.some((c) => c === "update")).toBe(false);
    expect(fake.calls.some((c) => c === "insert")).toBe(false);
  });
});