import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({})),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn(() => ({})),
}));

import { resolveMatchedArtworksForReports } from "../reports-repository";

type Result = { data?: unknown; error?: unknown };

function query(result: Result = {}) {
  const terminal = { data: result.data ?? null, error: result.error ?? null };
  const q: Record<string, unknown> = {
    then(resolve: (v: unknown) => void, reject: (e: unknown) => void) {
      return Promise.resolve(terminal).then(resolve, reject);
    },
    select: () => q,
    in: () => q,
    eq: () => q,
  };
  return q;
}

/** Supabase stub that answers per table so a test can assert the queries run. */
function supabaseStub(handlers: Record<string, Result>) {
  const from = vi.fn((table: string) => query(handlers[table] ?? { data: [] }));
  return { from };
}

const ARTWORK_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_ARTWORK_ID = "33333333-3333-4333-8333-333333333333";
const REPORT_ID = "22222222-2222-4222-8222-222222222222";

const ARTWORK_ROW = {
  id: ARTWORK_ID,
  title: "Sunset",
  c_secure_url: "https://x/img.png",
  status: "active",
};

function makeReport(overrides: Record<string, unknown> = {}) {
  return {
    id: REPORT_ID,
    reported_art_post_id: null as string | null,
    target_type: "artwork" as string | null,
    target_id: ARTWORK_ID as string | null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("resolveMatchedArtworksForReports", () => {
  it("resolves matched artwork for plagiarism reports keyed by target_id", async () => {
    const supabase = supabaseStub({ registered_arts: { data: [ARTWORK_ROW] } });

    const map = await resolveMatchedArtworksForReports(supabase as never, [
      makeReport(),
    ]);

    expect(supabase.from).toHaveBeenCalledWith("registered_arts");
    expect(map.get(REPORT_ID)).toMatchObject({
      id: ARTWORK_ID,
      title: "Sunset",
      c_secure_url: "https://x/img.png",
      status: "active",
    });
  });

  it("uses the embedded artwork without querying art_posts", async () => {
    const supabase = supabaseStub({ registered_arts: { data: [ARTWORK_ROW] } });

    const map = await resolveMatchedArtworksForReports(supabase as never, [
      makeReport({
        target_id: null,
        reported_art_post_id: "post-1",
        reported_art_post: { id: "post-1", registered_arts: { id: ARTWORK_ID } },
      }),
    ]);

    expect(supabase.from).not.toHaveBeenCalledWith("art_posts");
    expect(map.get(REPORT_ID)?.title).toBe("Sunset");
  });

  it("normalises an array-shaped embed", async () => {
    const supabase = supabaseStub({ registered_arts: { data: [ARTWORK_ROW] } });

    const map = await resolveMatchedArtworksForReports(supabase as never, [
      makeReport({
        target_id: null,
        reported_art_post: { id: "post-1", registered_arts: [{ id: ARTWORK_ID }] },
      }),
    ]);

    expect(map.get(REPORT_ID)?.id).toBe(ARTWORK_ID);
  });

  it("resolves through the reported art post when no target_id is set", async () => {
    const supabase = supabaseStub({
      art_posts: { data: [{ id: "post-1", art_id: ARTWORK_ID }] },
      registered_arts: { data: [ARTWORK_ROW] },
    });

    const map = await resolveMatchedArtworksForReports(supabase as never, [
      makeReport({ target_id: null, reported_art_post_id: "post-1" }),
    ]);

    expect(supabase.from).toHaveBeenCalledWith("art_posts");
    expect(map.get(REPORT_ID)).toMatchObject({ id: ARTWORK_ID, title: "Sunset" });
  });

  it("prefers target_id over the reported art post", async () => {
    const supabase = supabaseStub({
      art_posts: { data: [{ id: "post-1", art_id: OTHER_ARTWORK_ID }] },
      registered_arts: {
        data: [ARTWORK_ROW, { ...ARTWORK_ROW, id: OTHER_ARTWORK_ID, title: "Copy" }],
      },
    });

    const map = await resolveMatchedArtworksForReports(supabase as never, [
      makeReport({ reported_art_post_id: "post-1" }),
    ]);

    expect(map.get(REPORT_ID)?.id).toBe(ARTWORK_ID);
  });

  it("batches every unresolved post into a single art_posts query", async () => {
    const supabase = supabaseStub({
      art_posts: {
        data: [
          { id: "post-1", art_id: ARTWORK_ID },
          { id: "post-2", art_id: OTHER_ARTWORK_ID },
        ],
      },
      registered_arts: {
        data: [ARTWORK_ROW, { ...ARTWORK_ROW, id: OTHER_ARTWORK_ID, title: "Copy" }],
      },
    });

    const map = await resolveMatchedArtworksForReports(supabase as never, [
      makeReport({ id: "report-a", target_id: null, reported_art_post_id: "post-1" }),
      makeReport({ id: "report-b", target_id: null, reported_art_post_id: "post-2" }),
    ]);

    const postQueries = supabase.from.mock.calls.filter(([t]) => t === "art_posts");
    expect(postQueries).toHaveLength(1);
    expect(map.get("report-a")?.title).toBe("Sunset");
    expect(map.get("report-b")?.title).toBe("Copy");
  });

  it("ignores reports with no artwork link at all", async () => {
    const supabase = supabaseStub({ registered_arts: { data: [ARTWORK_ROW] } });

    const map = await resolveMatchedArtworksForReports(supabase as never, [
      makeReport({ target_id: null, target_type: "user" }),
    ]);

    expect(supabase.from).not.toHaveBeenCalled();
    expect(map.size).toBe(0);
  });

  it("degrades gracefully when the artwork lookup fails", async () => {
    const supabase = supabaseStub({ registered_arts: { error: { message: "boom" } } });

    const map = await resolveMatchedArtworksForReports(supabase as never, [
      makeReport(),
    ]);

    expect(map.size).toBe(0);
  });

  it("degrades gracefully when the art post lookup fails", async () => {
    const supabase = supabaseStub({
      art_posts: { error: { message: "boom" } },
      registered_arts: { data: [ARTWORK_ROW] },
    });

    const map = await resolveMatchedArtworksForReports(supabase as never, [
      makeReport({ target_id: null, reported_art_post_id: "post-1" }),
    ]);

    expect(map.size).toBe(0);
  });
});
