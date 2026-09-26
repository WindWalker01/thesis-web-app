import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatFileSize,
  readImageDimensions,
} from "@/features/public/plagiarise-checker/lib/file-metadata";

describe("formatFileSize", () => {
  it("formats bytes, KB and MB with sensible precision", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(1536 * 1024)).toBe("1.5 MB");
  });

  it("handles invalid input gracefully", () => {
    expect(formatFileSize(-1)).toBe("—");
    expect(formatFileSize(NaN)).toBe("—");
  });
});

describe("readImageDimensions", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("resolves null when the Image constructor is unavailable", async () => {
    vi.stubGlobal("Image", undefined);
    const file = new File([new ArrayBuffer(8)], "a.png", { type: "image/png" });
    await expect(readImageDimensions(file)).resolves.toBeNull();
  });
});
