import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { classifyArtworkFile } from "../api-client";
import type { ClassificationLabel } from "../../../types";

function makeFile(type = "image/png", size = 8): File {
  return new File([new ArrayBuffer(size)], "test.png", { type });
}

describe("classifyArtworkFile", () => {
  const originalEnv = process.env.NEXT_PUBLIC_DIGITAL_ART_API_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_DIGITAL_ART_API_URL = "https://api.example.test";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.NEXT_PUBLIC_DIGITAL_ART_API_URL = originalEnv;
  });

  it("posts the file to /classify/ with a 90s timeout and returns normalized predictions", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          { label: "  Portrait ", score: 0.9, index: 0 },
          { label: "", score: 0.1, index: 1 },
        ],
      }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const file = makeFile();
    const result = await classifyArtworkFile(file);

    expect(result.success).toBe(true);
    expect(
      (result as { predictions: ClassificationLabel[] }).predictions,
    ).toEqual([{ label: "Portrait", score: 0.9, index: 0 }]);

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.example.test/classify/");
    expect(init.method).toBe("POST");
    expect((init.body as FormData).get("file")).toBe(file);
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("rejects unsupported formats via the shared schema before any request", async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    const result = await classifyArtworkFile(makeFile("text/plain"));

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/Unsupported format/);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("surfaces backend detail messages verbatim for JSON errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ detail: "Image decoding failed" }),
      }),
    );

    const result = await classifyArtworkFile(makeFile());
    expect(result).toEqual({ success: false, message: "Image decoding failed" });
  });

  it("guards against non-JSON (HTML) error pages from the HF proxy", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        headers: new Headers({ "content-type": "text/html" }),
        text: async () => "<html>Space is waking up</html>",
      }),
    );

    const result = await classifyArtworkFile(makeFile());
    expect(result).toEqual({
      success: false,
      message: "Server error (503): <html>Space is waking up</html>",
    });
  });

  it("maps network failures to actionable connectivity guidance", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );

    const result = await classifyArtworkFile(makeFile());
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/internet connection/i);
  });

  it("returns a clear error when the API URL is not configured", async () => {
    process.env.NEXT_PUBLIC_DIGITAL_ART_API_URL = "";
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    const result = await classifyArtworkFile(makeFile());
    expect(result).toEqual({
      success: false,
      message:
        "Classification service URL is not configured in the environment.",
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("reports an error when the classifier returns no usable predictions", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ results: [] }) }),
    );

    const result = await classifyArtworkFile(makeFile());
    expect(result).toEqual({
      success: false,
      message: "The classifier returned no usable genre predictions.",
    });
  });
});
