import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { uploadFileToCloudinary } from "../direct-upload";

const { mockSignature } = vi.hoisted(() => ({ mockSignature: vi.fn() }));

vi.mock("../signature", () => ({
  getCloudinaryUploadSignature: mockSignature,
}));

function makeFile(size = 8): File {
  return new File([new ArrayBuffer(size)], "asset.png", { type: "image/png" });
}

const SIGNATURE_OK = {
  success: true as const,
  apiKey: "key-123",
  timestamp: 1_700_000_000,
  signature: "sig-abc",
  cloudName: "test-cloud",
  folder: "registered-arts",
};

describe("uploadFileToCloudinary", () => {
  const originalEnv = process.env.NEXT_PUBLIC_DIGITAL_ART_API_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSignature.mockResolvedValue(SIGNATURE_OK);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.NEXT_PUBLIC_DIGITAL_ART_API_URL = originalEnv;
  });

  it("uploads the raw file directly to Cloudinary with the signed payload", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        public_id: "registered-arts/abc123",
        asset_id: "asset-9",
        secure_url: "https://res.cloudinary.com/test-cloud/image/upload/v1/registered-arts/abc123.png",
        format: "png",
        bytes: 8,
        width: 100,
        height: 50,
      }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const file = makeFile();
    const result = await uploadFileToCloudinary(file, "registered-arts");

    expect(result.publicId).toBe("registered-arts/abc123");
    expect(result.assetId).toBe("asset-9");
    expect(result.bytes).toBe(8);

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      "https://api.cloudinary.com/v1_1/test-cloud/image/upload",
    );
    expect(init.method).toBe("POST");

    const formData = init.body as FormData;
    expect(formData.get("file")).toBe(file);
    expect(formData.get("api_key")).toBe("key-123");
    expect(formData.get("timestamp")).toBe("1700000000");
    expect(formData.get("signature")).toBe("sig-abc");
    expect(formData.get("folder")).toBe("registered-arts");
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("uses the auto resource-type endpoint when requested", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ public_id: "review-evidence/x", secure_url: "https://res.cloudinary.com/test-cloud/auto/upload/v1/review-evidence/x" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await uploadFileToCloudinary(makeFile(), "review-evidence", {
      resourceType: "auto",
    });

    const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.cloudinary.com/v1_1/test-cloud/auto/upload");
  });

  it("surfaces Cloudinary error messages", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: { message: "File size too large" } }),
      }),
    );

    await expect(
      uploadFileToCloudinary(makeFile(), "registered-arts"),
    ).rejects.toThrow("File size too large");
  });

  it("maps network failures to actionable guidance", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );

    await expect(
      uploadFileToCloudinary(makeFile(), "registered-arts"),
    ).rejects.toThrow(/internet connection/i);
  });

  it("rejects when the signature action refuses", async () => {
    mockSignature.mockResolvedValue({
      success: false,
      message: "Authentication required.",
    });

    await expect(
      uploadFileToCloudinary(makeFile(), "registered-arts"),
    ).rejects.toThrow("Authentication required.");
  });

  it("rejects on an unexpected Cloudinary response shape", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      }),
    );

    await expect(
      uploadFileToCloudinary(makeFile(), "registered-arts"),
    ).rejects.toThrow("Storage upload failed: unexpected response.");
  });
});
