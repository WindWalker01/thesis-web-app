import { describe, expect, it } from "vitest";

import { cloudinaryAssetMetadataSchema } from "../metadata-schema";

const VALID = {
  publicId: "registered-arts/abc123",
  assetId: "asset-9",
  secureUrl:
    "https://res.cloudinary.com/test-cloud/image/upload/v1/registered-arts/abc123.png",
  bytes: 1024,
  fileName: "artwork.png",
  mimeType: "image/png",
};

describe("cloudinaryAssetMetadataSchema", () => {
  it("accepts well-formed metadata", () => {
    const parsed = cloudinaryAssetMetadataSchema.safeParse(VALID);
    expect(parsed.success).toBe(true);
  });

  it("rejects non-Cloudinary hosts (server downloads must not be redirectable)", () => {
    const parsed = cloudinaryAssetMetadataSchema.safeParse({
      ...VALID,
      secureUrl: "https://evil.example.com/image.png",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects malformed URLs", () => {
    const parsed = cloudinaryAssetMetadataSchema.safeParse({
      ...VALID,
      secureUrl: "not-a-url",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects a missing publicId", () => {
    const parsed = cloudinaryAssetMetadataSchema.safeParse({
      ...VALID,
      publicId: undefined,
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects negative byte sizes", () => {
    const parsed = cloudinaryAssetMetadataSchema.safeParse({
      ...VALID,
      bytes: -1,
    });
    expect(parsed.success).toBe(false);
  });
});
