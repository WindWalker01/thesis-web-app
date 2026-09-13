// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { downloadCloudinaryAsset } from "../upload-image";

describe("downloadCloudinaryAsset", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns a Buffer of the exact asset bytes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new TextEncoder().encode("abc").buffer,
      }),
    );

    const buf = await downloadCloudinaryAsset(
      "https://res.cloudinary.com/test-cloud/image/upload/v1/x.png",
    );

    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.toString("utf8")).toBe("abc");
  });

  it("throws a readable error on non-OK responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404 }),
    );

    await expect(
      downloadCloudinaryAsset(
        "https://res.cloudinary.com/test-cloud/image/upload/v1/x.png",
      ),
    ).rejects.toThrow("Failed to load the stored image (404)");
  });
});
