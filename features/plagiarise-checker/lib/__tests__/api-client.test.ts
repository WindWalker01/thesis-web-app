import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { checkPlagiarismCompareFiles } from "../api-client";
import type { CompareResponse } from "../../types";

function makeFile(name: string, size = 8): File {
  return new File([new ArrayBuffer(size)], name, { type: "image/png" });
}

function makeCompareResponse(): CompareResponse {
  return {
    image1: "a.png",
    image2: "b.png",
    comparison: {
      transform_similarity: 0.1,
      block_similarity: 0.2,
      final_similarity: 0.15,
    },
  };
}

describe("checkPlagiarismCompareFiles", () => {
  const originalEnv = process.env.NEXT_PUBLIC_DIGITAL_ART_API_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_DIGITAL_ART_API_URL = "https://api.example.test";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.NEXT_PUBLIC_DIGITAL_ART_API_URL = originalEnv;
  });

  it("posts both files to /plagiarism/compare with a 90s timeout and returns the parsed response", async () => {
    const mockResponse = makeCompareResponse();
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });
    vi.stubGlobal("fetch", mockFetch);

    const file1 = makeFile("a.png");
    const file2 = makeFile("b.png");
    const result = await checkPlagiarismCompareFiles(file1, file2);

    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledOnce();

    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.example.test/plagiarism/compare");
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);

    const formData = init.body as FormData;
    expect(formData.get("file1")).toBe(file1);
    expect(formData.get("file2")).toBe(file2);
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("throws the backend detail message for JSON error responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ detail: "Images must be PNG or JPEG" }),
      }),
    );

    await expect(
      checkPlagiarismCompareFiles(makeFile("a.png"), makeFile("b.png")),
    ).rejects.toThrow("Images must be PNG or JPEG");
  });

  it("falls back to a generic message for JSON errors without a detail field", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({}),
      }),
    );

    await expect(
      checkPlagiarismCompareFiles(makeFile("a.png"), makeFile("b.png")),
    ).rejects.toThrow("Failed to compare images");
  });

  it("guards against non-JSON (HTML) error pages from the HF proxy", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        headers: new Headers({ "content-type": "text/html" }),
        text: async () => "<html>Request Entity Too Large</html>",
      }),
    );

    await expect(
      checkPlagiarismCompareFiles(makeFile("a.png"), makeFile("b.png")),
    ).rejects.toThrow("Server error (503): <html>Request Entity Too Large</html>");
  });

  it("propagates network failures for upstream error mapping", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );

    await expect(
      checkPlagiarismCompareFiles(makeFile("a.png"), makeFile("b.png")),
    ).rejects.toThrow("Failed to fetch");
  });

  it("fails fast with a clear error when the API URL is not configured", async () => {
    process.env.NEXT_PUBLIC_DIGITAL_ART_API_URL = "";
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    await expect(
      checkPlagiarismCompareFiles(makeFile("a.png"), makeFile("b.png")),
    ).rejects.toThrow("Plagiarism API URL is not configured.");
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
