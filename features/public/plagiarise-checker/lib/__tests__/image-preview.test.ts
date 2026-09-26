import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dataUrlToFile, fileToPreviewDataUrl } from "../image-preview";

/** Minimal 1x1 PNG, used as a realistic base64 payload. */
const PNG_1PX =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

/** Reads a Blob back into a data URL so a round-trip can be asserted. */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

describe("dataUrlToFile", () => {
  it("rebuilds a File from a base64 data URL", () => {
    const file = dataUrlToFile(PNG_1PX, "artwork.png");

    expect(file).toBeInstanceOf(File);
    expect(file?.name).toBe("artwork.png");
    expect(file?.type).toBe("image/png");
    expect(file?.size).toBeGreaterThan(0);
  });

  it("round-trips the bytes back to an equivalent data URL", async () => {
    const file = dataUrlToFile(PNG_1PX, "artwork.png");
    expect(file).not.toBeNull();

    // The payload is preserved byte-for-byte, so the round trip is lossless.
    expect(await blobToDataUrl(file!)).toBe(PNG_1PX);
  });

  it("handles a percent-encoded (non-base64) data URL", () => {
    const file = dataUrlToFile("data:text/plain,hello%20world", "note.txt");

    expect(file?.type).toBe("text/plain");
    expect(file?.size).toBe("hello world".length);
  });

  it("returns null for a non-data URL", () => {
    expect(dataUrlToFile("https://cdn.test/artwork.png", "a.png")).toBeNull();
  });

  it("returns null for an empty value", () => {
    expect(dataUrlToFile("", "a.png")).toBeNull();
  });
});

describe("fileToPreviewDataUrl", () => {
  beforeEach(() => {
    // jsdom implements neither canvas nor object URLs; stub just enough to
    // exercise the downscale path and its failure modes.
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:preview"),
      revokeObjectURL: vi.fn(),
    });
    class FakeImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      width = 2000;
      height = 2000;
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
    vi.stubGlobal("Image", FakeImage);
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      drawImage: vi.fn(),
    })) as unknown as HTMLCanvasElement["getContext"];
    HTMLCanvasElement.prototype.toDataURL = vi.fn(
      () => "data:image/jpeg;base64,SMALL",
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns null for a non-image file", async () => {
    const file = new File(["%PDF-1.4"], "doc.pdf", {
      type: "application/pdf",
    });

    await expect(fileToPreviewDataUrl(file)).resolves.toBeNull();
  });

  it("returns a downscaled JPEG data URL for an image file", async () => {
    const file = new File([new Uint8Array([1, 2, 3])], "big.png", {
      type: "image/png",
    });

    await expect(fileToPreviewDataUrl(file)).resolves.toBe(
      "data:image/jpeg;base64,SMALL",
    );
  });

  it("never throws when the canvas context is unavailable", async () => {
    HTMLCanvasElement.prototype.getContext = vi.fn(
      () => null,
    ) as unknown as HTMLCanvasElement["getContext"];
    const file = new File([new Uint8Array([1])], "a.png", { type: "image/png" });

    await expect(fileToPreviewDataUrl(file)).resolves.toBeNull();
  });
});
