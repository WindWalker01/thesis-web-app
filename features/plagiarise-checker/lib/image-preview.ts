/**
 * Client-side helpers for carrying a small preview of the reporter's artwork
 * across the authentication round-trip.
 *
 * A browser `File` cannot be serialised into sessionStorage, so a pending
 * report stores a downscaled data URL instead. The helpers are deliberately
 * defensive: they return `null` rather than throwing, because losing a preview
 * must never block a report from being filed.
 */
/** Longest edge of the generated preview, in CSS pixels. */
const PREVIEW_MAX_EDGE = 512;
/** JPEG quality for the generated preview. */
const PREVIEW_QUALITY = 0.8;

/**
 * Downscales an image file to a small JPEG data URL.
 *
 * Returns `null` for non-image files, oversized/undecodable images, or when the
 * canvas API is unavailable (e.g. jsdom, older Safari).
 */
export function fileToPreviewDataUrl(
  file: File,
  maxEdge: number = PREVIEW_MAX_EDGE,
): Promise<string | null> {
  return new Promise((resolve) => {
    if (!file || typeof window === "undefined" || !file.type.startsWith("image/")) {
      resolve(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", PREVIEW_QUALITY));
      } catch {
        // Tainted canvas (cross-origin source) or unsupported encoding.
        resolve(null);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };

    img.src = objectUrl;
  });
}

/**
 * Rebuilds a `File` from a data URL so a stored preview can be uploaded to
 * Cloudinary as real evidence. Returns `null` for malformed or non-data URLs.
 */
export function dataUrlToFile(
  dataUrl: string,
  filename: string,
): File | null {
  if (!dataUrl || !dataUrl.startsWith("data:")) return null;

  const match = /^data:([^;,]+)?(;base64)?,(.*)$/.exec(dataUrl);
  if (!match) return null;

  const mimeType = match[1] || "application/octet-stream";
  const isBase64 = !!match[2];
  const payload = match[3] ?? "";

  try {
    let bytes: Uint8Array;
    if (isBase64) {
      const binary = atob(payload);
      bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
    } else {
      bytes = new TextEncoder().encode(decodeURIComponent(payload));
    }
    // TS 5.7 made Uint8Array generic over its backing buffer; the bytes here
    // are always a plain ArrayBuffer built above, so the cast is safe.
    return new File([bytes as unknown as BlobPart], filename, {
      type: mimeType,
    });
  } catch {
    return null;
  }
}

/**
 * Client-only storage for the pending plagiarism match action, used to preserve
 * the selected match/action across the authentication round-trip. The context
 * is fully serialisable (no File bytes), so it survives sessionStorage.
 */

