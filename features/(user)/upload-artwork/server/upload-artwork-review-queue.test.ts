// @vitest-environment node
//
// This suite runs in the Node environment (not jsdom) because the unit under
// test hashes the uploaded file with Node's Buffer + ethers. In the jsdom
// realm, Buffer objects are cross-realm and ethers' `instanceof Uint8Array`
// check rejects them ("invalid BytesLike value").
import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Regression tests for the bug:
 *   "100% web match not entering the Admin Artwork Verification queue"
 *
 * Root cause: the artwork_reviews insert in Step 7 of recordArtworkInDatabase
 * used the artist-scoped (RLS-restricted) server client, while the only INSERT
 * policy on artwork_reviews is admin-only. The insert failed with Postgres
 * 42501 and the error was swallowed, so no review row ever existed and the
 * Admin → Artwork Verification queue (which selects from artwork_reviews)
 * never showed the artwork.
 *
 * Fix: Step 7 now uses the service-role admin client and guards against
 * duplicate review rows.
 *
 * These tests assert, at the unit level:
 *  T1 — a web match below 100% (below manual-review threshold) creates NO review
 *  T2 — a web match at exactly 100% creates a pending review via the ADMIN client
 *  T3 — the created review is queue-visible (status "pending", reviewer null)
 *  T4 — covered by the untouched admin reviews module tests (approve/reject/
 *       request-information are not modified by the fix)
 *  T5 — a second processing of the same artwork never creates a duplicate review
 *  T6 — a failed similarity scan creates no artwork/scan/review at all
 */

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn(),
}));

vi.mock("@/lib/account-status", () => ({
  requireActiveAccount: vi.fn(),
}));

vi.mock("@/features/plagiarise-checker", () => ({
  checkPlagiarismWeb: vi.fn(),
}));

vi.mock("@/features/(user)/upload-artwork/server/upload-image", () => ({
  uploadArtworkImageToCloudinary: vi.fn(),
  deleteArtworkImageFromCloudinary: vi.fn(),
}));

vi.mock("@/features/admin/settings/lib/runtime-settings", () => ({
  getRuntimeSettings: vi.fn(),
}));

vi.mock("@/features/(user)/upload-artwork/server/fetch-genre", () => ({
  fetchGenreClassification: vi.fn(),
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireActiveAccount } from "@/lib/account-status";
import { checkPlagiarismWeb } from "@/features/plagiarise-checker";
import {
  uploadArtworkImageToCloudinary,
  deleteArtworkImageFromCloudinary,
} from "@/features/(user)/upload-artwork/server/upload-image";
import { getRuntimeSettings } from "@/features/admin/settings/lib/runtime-settings";
import { fetchGenreClassification } from "@/features/(user)/upload-artwork/server/fetch-genre";

import { recordArtworkInDatabase } from "./upload-artwork";
import type { RecordArtworkInDatabaseResult } from "../types";

/** Asserts upload success and narrows the discriminated union. */
function expectUploadSuccess(result: RecordArtworkInDatabaseResult) {
  expect(result.success).toBe(true);
  if (!result.success) {
    throw new Error(`Expected upload to succeed, got: ${result.message}`);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Test context + supabase mock builders
// ---------------------------------------------------------------------------

const USER_ID = "user-artist-1";
const ARTWORK_ID = "11111111-2222-3333-4444-555555555555";

interface Ctx {
  /** Captured artwork_reviews inserts made through the ADMIN client. */
  reviewInserts: Array<Record<string, unknown>>;
  /** Captured artwork_reviews inserts made through the USER client (must stay empty). */
  userClientReviewInserts: Array<Record<string, unknown>>;
  /** Captured registered_arts inserts (user client). */
  artworkInserts: Array<Record<string, unknown>>;
  /** Captured art_similarity_scans inserts (user client). */
  scanInserts: Array<Record<string, unknown>>;
  /** Pre-existing review returned by the idempotency check. */
  existingReview: { id: string } | null;
  /** Error returned by the admin review insert, if any. */
  reviewInsertError: { code: string; message: string } | null;
}

function makeCtx(overrides: Partial<Ctx> = {}): Ctx {
  return {
    reviewInserts: [],
    userClientReviewInserts: [],
    artworkInserts: [],
    scanInserts: [],
    existingReview: null,
    reviewInsertError: null,
    ...overrides,
  };
}

/** Minimal thenable query chain, mirroring the supabase-js fluent API. */
function makeChain(resolveWith: () => { data: unknown; error: unknown }) {
  const q: Record<string, (...args: unknown[]) => unknown> = {};
  for (const m of [
    "select",
    "eq",
    "neq",
    "in",
    "is",
    "not",
    "update",
    "delete",
    "single",
    "maybeSingle",
    "order",
    "limit",
    "range",
  ]) {
    q[m] = () => q;
  }
  q.then = ((onFulfilled: (v: unknown) => void) => {
    onFulfilled(resolveWith());
  }) as (...args: unknown[]) => unknown;
  return q;
}

/**
 * User-scoped (RLS) client mock. Handles:
 *  - registered_arts duplicate check (select → null) and insert (→ new id)
 *  - art_similarity_scans insert
 * Any artwork_reviews access through this client is captured separately so we
 * can prove the artist context is never (successfully) used for reviews.
 */
function makeUserSupabase(ctx: Ctx) {
  return {
    from: vi.fn((table: string): unknown => {
      if (table === "registered_arts") {
        let inserted = false;
        const q = makeChain(() => ({
          data: inserted ? { id: ARTWORK_ID } : null,
          error: null,
        }));
        q.insert = (rows: unknown) => {
          inserted = true;
          ctx.artworkInserts.push(rows as Record<string, unknown>);
          return q;
        };
        return q;
      }
      if (table === "art_similarity_scans") {
        return {
          insert: (rows: unknown) => {
            ctx.scanInserts.push(rows as Record<string, unknown>);
            return { error: null };
          },
        };
      }
      if (table === "artwork_reviews") {
        // Simulates what happens when the artist context touches the table.
        return {
          insert: (rows: unknown) => {
            ctx.userClientReviewInserts.push(rows as Record<string, unknown>);
            return {
              error: {
                code: "42501",
                message:
                  'new row violates row-level security policy for table "artwork_reviews"',
              },
            };
          },
        };
      }
      throw new Error(`Unexpected table on user client: ${table}`);
    }),
  };
}

/** Service-role (RLS bypass) client mock — the path the fix must use. */
function makeAdminSupabase(ctx: Ctx) {
  return {
    from: vi.fn((table: string): unknown => {
      if (table === "artwork_reviews") {
        const q = makeChain(() => ({
          data: ctx.existingReview,
          error: null,
        }));
        q.insert = (rows: unknown) => {
          ctx.reviewInserts.push(rows as Record<string, unknown>);
          return { error: ctx.reviewInsertError };
        };
        return q;
      }
      if (table === "registered_arts") {
        // DB-match enrichment lookup (not exercised by web-match tests).
        return makeChain(() => ({ data: null, error: null }));
      }
      throw new Error(`Unexpected table on admin client: ${table}`);
    }),
  };
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeTestFile(): File {
  const bytes = new TextEncoder().encode("fake image bytes for hashing");
  const file = new File([bytes], "artwork.png", { type: "image/png" });
  if (typeof file.arrayBuffer !== "function") {
    (
      file as unknown as { arrayBuffer: () => Promise<ArrayBuffer> }
    ).arrayBuffer = async () =>
      bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
      ) as ArrayBuffer;
  }
  return file;
}

function makeFormData(): FormData {
  const formData = new FormData();
  formData.append("title", "Test artwork upload");
  formData.append("description", "regression test");
  formData.append("rightsConfirmed", "true");
  formData.append("file", makeTestFile());
  return formData;
}

/** Builds a plagiarism API result whose strongest match is a WEB/internet match. */
function makeWebScanResult(similarity: number) {
  const webMatch = {
    type: "internet",
    source: "Wallpaper Cave",
    url: "https://wallpapercave.com/wp/wp16251067.webp",
    link: "https://wallpapercave.com/black-anime-girl-phone-wallpapers",
    similarity,
  };
  return {
    success: true,
    filename: "artwork.png",
    original_hash: "a1b2c3d4e5f60708",
    hashes: { transforms: {}, blocks: {} },
    db: null,
    web: webMatch,
    best_match: webMatch,
    other_matches: [],
  };
}

/** Builds a plagiarism API result whose strongest match is a DATABASE match. */
function makeDbScanResult(similarity: number) {
  const dbMatch = {
    type: "database",
    source: "ArtForgeLab Registry",
    url: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeffff0000", // UUID of the matched artwork
    link: null,
    similarity,
  };
  return {
    success: true,
    filename: "artwork.png",
    original_hash: "a1b2c3d4e5f60708",
    hashes: { transforms: {}, blocks: {} },
    db: dbMatch,
    web: null,
    best_match: dbMatch,
    other_matches: [],
  };
}

// ---------------------------------------------------------------------------
// Mock wiring
// ---------------------------------------------------------------------------

const serverClientMock = createSupabaseServerClient as unknown as ReturnType<
  typeof vi.fn
>;
const adminClientMock = createSupabaseAdminClient as unknown as ReturnType<
  typeof vi.fn
>;
const requireActiveAccountMock = requireActiveAccount as unknown as ReturnType<
  typeof vi.fn
>;
const checkPlagiarismWebMock = checkPlagiarismWeb as unknown as ReturnType<
  typeof vi.fn
>;
const uploadImageMock = uploadArtworkImageToCloudinary as unknown as ReturnType<
  typeof vi.fn
>;
const deleteImageMock =
  deleteArtworkImageFromCloudinary as unknown as ReturnType<typeof vi.fn>;
const getRuntimeSettingsMock = getRuntimeSettings as unknown as ReturnType<
  typeof vi.fn
>;
const fetchGenreMock = fetchGenreClassification as unknown as ReturnType<
  typeof vi.fn
>;

beforeEach(() => {
  vi.clearAllMocks();

  requireActiveAccountMock.mockResolvedValue(USER_ID);

  getRuntimeSettingsMock.mockResolvedValue({
    enable_automatic_scanning: true,
    enable_duplicate_file_detection: false,
    similarity_threshold: 80,
    manual_review_threshold: 60,
    db_match_display_threshold: 60,
    min_render_threshold: 60,
  });

  uploadImageMock.mockResolvedValue({
    assetId: "asset-1",
    secureUrl: "https://cdn.example.com/artwork.png",
    publicId: "registered-arts/artwork",
  });
  deleteImageMock.mockResolvedValue(undefined);

  fetchGenreMock.mockResolvedValue({ success: true, results: [] });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("recordArtworkInDatabase → manual review queue", () => {
  it("T1: a web match below the manual-review threshold creates NO artwork_reviews row", async () => {
    const ctx = makeCtx();
    serverClientMock.mockResolvedValue(makeUserSupabase(ctx));
    adminClientMock.mockReturnValue(makeAdminSupabase(ctx));
    checkPlagiarismWebMock.mockResolvedValue(makeWebScanResult(50));

    const result = expectUploadSuccess(
      await recordArtworkInDatabase(makeFormData()),
    );

    expect(result.artworkStatus).toBe("pending_blockchain");
    expect(ctx.artworkInserts).toHaveLength(1);
    expect(ctx.scanInserts).toHaveLength(1);
    // No review on either client
    expect(ctx.reviewInserts).toHaveLength(0);
    expect(ctx.userClientReviewInserts).toHaveLength(0);
  });

  it("T2/T3: a web match at exactly 100% creates a pending, unassigned review via the ADMIN (service-role) client", async () => {
    const ctx = makeCtx();
    serverClientMock.mockResolvedValue(makeUserSupabase(ctx));
    adminClientMock.mockReturnValue(makeAdminSupabase(ctx));
    checkPlagiarismWebMock.mockResolvedValue(makeWebScanResult(100));

    const result = expectUploadSuccess(
      await recordArtworkInDatabase(makeFormData()),
    );

    expect(result.artworkStatus).toBe("under_review");

    // Scan row records the true 100% web match
    expect(ctx.scanInserts).toHaveLength(1);
    expect(ctx.scanInserts[0]).toMatchObject({
      art_id: ARTWORK_ID,
      status: "completed",
      success: true,
      best_similarity_percentage: 100,
      best_source: "Wallpaper Cave",
    });

    // Exactly one review created — through the service-role client, never the artist client
    expect(ctx.reviewInserts).toHaveLength(1);
    expect(ctx.userClientReviewInserts).toHaveLength(0);
    expect(ctx.reviewInserts[0]).toEqual({
      artwork_id: ARTWORK_ID,
      status: "pending", // visible in the default Admin Verification queue
      reviewer_id: null, // unassigned — queue does not require assignment
      assigned_at: null,
    });
  });

  it("creates a review for high-similarity (>= flagged threshold) web matches instead of rejecting", async () => {
    const ctx = makeCtx();
    serverClientMock.mockResolvedValue(makeUserSupabase(ctx));
    adminClientMock.mockReturnValue(makeAdminSupabase(ctx));
    checkPlagiarismWebMock.mockResolvedValue(makeWebScanResult(85));

    const result = expectUploadSuccess(
      await recordArtworkInDatabase(makeFormData()),
    );

    // Web matches are never auto-rejected — held for manual review
    expect(result.artworkStatus).toBe("under_review");
    expect(ctx.artworkInserts).toHaveLength(1);
    expect(ctx.reviewInserts).toHaveLength(1);
    expect(ctx.reviewInserts[0]).toMatchObject({
      artwork_id: ARTWORK_ID,
      status: "pending",
    });
  });

  it("auto-rejects a database match at the similarity threshold (no upload, no scan, no review)", async () => {
    const ctx = makeCtx();
    serverClientMock.mockResolvedValue(makeUserSupabase(ctx));
    adminClientMock.mockReturnValue(makeAdminSupabase(ctx));
    checkPlagiarismWebMock.mockResolvedValue(makeDbScanResult(85));

    const result = await recordArtworkInDatabase(makeFormData());

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/upload blocked/i);
    expect(result.message).toContain("85%");
    // Nothing persisted at all
    expect(ctx.artworkInserts).toHaveLength(0);
    expect(ctx.scanInserts).toHaveLength(0);
    expect(ctx.reviewInserts).toHaveLength(0);
    // No Cloudinary asset was uploaded either
    expect(uploadImageMock).not.toHaveBeenCalled();
  });

  it("auto-rejects an exact 100% database match", async () => {
    const ctx = makeCtx();
    serverClientMock.mockResolvedValue(makeUserSupabase(ctx));
    adminClientMock.mockReturnValue(makeAdminSupabase(ctx));
    checkPlagiarismWebMock.mockResolvedValue(makeDbScanResult(100));

    const result = await recordArtworkInDatabase(makeFormData());

    expect(result.success).toBe(false);
    expect(ctx.artworkInserts).toHaveLength(0);
    expect(ctx.scanInserts).toHaveLength(0);
    expect(ctx.reviewInserts).toHaveLength(0);
  });

  it("holds a database match between the review and similarity thresholds for manual review", async () => {
    const ctx = makeCtx();
    serverClientMock.mockResolvedValue(makeUserSupabase(ctx));
    adminClientMock.mockReturnValue(makeAdminSupabase(ctx));
    checkPlagiarismWebMock.mockResolvedValue(makeDbScanResult(70));

    const result = expectUploadSuccess(
      await recordArtworkInDatabase(makeFormData()),
    );

    expect(result.artworkStatus).toBe("under_review");
    expect(ctx.artworkInserts).toHaveLength(1);
    expect(ctx.scanInserts).toHaveLength(1);
    expect(ctx.reviewInserts).toHaveLength(1);
    expect(ctx.reviewInserts[0]).toMatchObject({
      artwork_id: ARTWORK_ID,
      status: "pending",
    });
  });

  it("T5: does not create a duplicate review when one already exists for the artwork", async () => {
    const ctx = makeCtx({ existingReview: { id: "existing-review-1" } });
    serverClientMock.mockResolvedValue(makeUserSupabase(ctx));
    adminClientMock.mockReturnValue(makeAdminSupabase(ctx));
    checkPlagiarismWebMock.mockResolvedValue(makeWebScanResult(100));

    const result = expectUploadSuccess(
      await recordArtworkInDatabase(makeFormData()),
    );

    expect(result.artworkStatus).toBe("under_review");
    expect(ctx.reviewInserts).toHaveLength(0);
    expect(ctx.userClientReviewInserts).toHaveLength(0);
  });

  it("T6: a failed similarity scan creates no artwork, scan, or review records", async () => {
    const ctx = makeCtx();
    serverClientMock.mockResolvedValue(makeUserSupabase(ctx));
    adminClientMock.mockReturnValue(makeAdminSupabase(ctx));
    checkPlagiarismWebMock.mockResolvedValue({
      success: false,
      filename: "artwork.png",
      other_matches: [],
    });

    const result = await recordArtworkInDatabase(makeFormData());

    expect(result.success).toBe(false);
    expect(ctx.artworkInserts).toHaveLength(0);
    expect(ctx.scanInserts).toHaveLength(0);
    expect(ctx.reviewInserts).toHaveLength(0);
    expect(ctx.userClientReviewInserts).toHaveLength(0);
  });

  it("still completes the upload (without a review) if the review insert itself errors", async () => {
    const ctx = makeCtx({
      reviewInsertError: { code: "23505", message: "duplicate key value" },
    });
    serverClientMock.mockResolvedValue(makeUserSupabase(ctx));
    adminClientMock.mockReturnValue(makeAdminSupabase(ctx));
    checkPlagiarismWebMock.mockResolvedValue(makeWebScanResult(100));

    const result = expectUploadSuccess(
      await recordArtworkInDatabase(makeFormData()),
    );

    // Upload is not rolled back (preserves existing resilience semantics),
    // but the artwork keeps its under_review status for admin follow-up.
    expect(result.artworkStatus).toBe("under_review");
    expect(ctx.reviewInserts).toHaveLength(1);
  });
});
