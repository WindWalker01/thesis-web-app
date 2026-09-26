// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/lib/account-status", () => ({
  requireActiveAccount: vi.fn(),
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireActiveAccount } from "@/lib/account-status";
import { updateUserAvatar } from "../edit-profile";

const serverClientMock = createSupabaseServerClient as unknown as ReturnType<
  typeof vi.fn
>;
const requireActiveAccountMock = requireActiveAccount as unknown as ReturnType<
  typeof vi.fn
>;

function makeSupabase() {
  let updatedRow: Record<string, unknown> | null = null;
  return {
    updatedRow: () => updatedRow,
    client: {
      from: vi.fn(() => ({
        update: vi.fn((row: Record<string, unknown>) => {
          updatedRow = row;
          return { eq: vi.fn().mockResolvedValue({ error: null }) };
        }),
      })),
    },
  };
}

const VALID = {
  publicId: "profile-images/abc",
  secureUrl:
    "https://res.cloudinary.com/test-cloud/image/upload/v1/profile-images/abc.png",
  bytes: "1024",
  mimeType: "image/png",
};

function makeFormData(overrides: Record<string, string | undefined> = {}) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(VALID)) {
    fd.append(key, value);
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) fd.delete(key);
    else fd.set(key, value);
  }
  return fd;
}

describe("updateUserAvatar — metadata-only contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLOUDINARY_NAME = "test-cloud";
    requireActiveAccountMock.mockResolvedValue("user-1");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.CLOUDINARY_NAME;
  });

  it("records the Cloudinary URL for an authenticated, valid avatar", async () => {
    const ctx = makeSupabase();
    serverClientMock.mockResolvedValue(ctx.client);

    const result = await updateUserAvatar(makeFormData());

    expect(result).toEqual({
      success: true,
      imageUrl: VALID.secureUrl,
    });
    expect(ctx.updatedRow()).toMatchObject({ c_profile_image: VALID.secureUrl });
  });

  it("rejects oversized images server-side", async () => {
    const ctx = makeSupabase();
    serverClientMock.mockResolvedValue(ctx.client);

    const result = await updateUserAvatar(makeFormData({ bytes: "6000000" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toMatch(/5 MB or smaller/);
    }
    expect(ctx.updatedRow()).toBeNull();
  });

  it("rejects unsupported mime types server-side", async () => {
    const ctx = makeSupabase();
    serverClientMock.mockResolvedValue(ctx.client);

    const result = await updateUserAvatar(makeFormData({ mimeType: "image/gif" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toMatch(/JPG, PNG, and WebP/);
    }
    expect(ctx.updatedRow()).toBeNull();
  });

  it("rejects secure URLs outside the project's Cloudinary cloud", async () => {
    const ctx = makeSupabase();
    serverClientMock.mockResolvedValue(ctx.client);

    const result = await updateUserAvatar(
      makeFormData({ secureUrl: "https://evil.example.com/avatar.png" }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toMatch(/Invalid storage URL/);
    }
    expect(ctx.updatedRow()).toBeNull();
  });

  it("blocks suspended or banned accounts", async () => {
    const ctx = makeSupabase();
    serverClientMock.mockResolvedValue(ctx.client);
    requireActiveAccountMock.mockRejectedValue(new Error("suspended"));

    const result = await updateUserAvatar(makeFormData());

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toMatch(/suspended or banned/);
    }
    expect(ctx.updatedRow()).toBeNull();
  });
});
