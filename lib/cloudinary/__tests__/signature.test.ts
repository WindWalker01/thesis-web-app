import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getCloudinaryUploadSignature } from "../signature";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";

const serverClientMock = createSupabaseServerClient as unknown as ReturnType<
  typeof vi.fn
>;

function makeAuthedSupabase(authed = true) {
  return {
    auth: {
      getUser: vi
        .fn()
        .mockResolvedValue({ data: { user: authed ? { id: "u1" } : null } }),
    },
  };
}

describe("getCloudinaryUploadSignature", () => {
  const originalEnv = {
    name: process.env.CLOUDINARY_NAME,
    key: process.env.CLOUDINARY_KEY,
    secret: process.env.CLOUDINARY_SECRET,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLOUDINARY_NAME = "test-cloud";
    process.env.CLOUDINARY_KEY = "test-key";
    process.env.CLOUDINARY_SECRET = "test-secret";
  });

  afterEach(() => {
    process.env.CLOUDINARY_NAME = originalEnv.name;
    process.env.CLOUDINARY_KEY = originalEnv.key;
    process.env.CLOUDINARY_SECRET = originalEnv.secret;
  });

  it("issues a deterministic signature for an allowed folder", async () => {
    serverClientMock.mockResolvedValue(makeAuthedSupabase());

    const result = await getCloudinaryUploadSignature("registered-arts");

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.cloudName).toBe("test-cloud");
    expect(result.apiKey).toBe("test-key");
    expect(result.folder).toBe("registered-arts");
    // sha1("folder=registered-arts&timestamp=<ts>" + secret) — verify against
    // an independent computation for the returned timestamp.
    const expected = await import("node:crypto").then(({ createHash }) =>
      createHash("sha1")
        .update(
          `folder=registered-arts&timestamp=${result.timestamp}test-secret`,
        )
        .digest("hex"),
    );
    expect(result.signature).toBe(expected);
  });

  it("requires an authenticated session", async () => {
    serverClientMock.mockResolvedValue(makeAuthedSupabase(false));

    const result = await getCloudinaryUploadSignature("registered-arts");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toMatch(/authentication/i);
    }
  });

  it("refuses folders outside the allowlist", async () => {
    serverClientMock.mockResolvedValue(makeAuthedSupabase());

    const result = await getCloudinaryUploadSignature("arbitrary-folder");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toMatch(/unsupported/i);
    }
  });

  it("fails fast when Cloudinary env is not configured", async () => {
    serverClientMock.mockResolvedValue(makeAuthedSupabase());
    delete process.env.CLOUDINARY_SECRET;

    const result = await getCloudinaryUploadSignature("profile-images");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toMatch(/not configured/i);
    }
  });
});
