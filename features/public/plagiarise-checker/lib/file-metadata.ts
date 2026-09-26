/**
 * Client-side helpers for reading artwork file metadata shown in the
 * plagiarism-checker upload preview (file size + image dimensions).
 */

export interface ArtworkFileMeta {
  size: number;
  type: string;
  width: number | null;
  height: number | null;
}

/** Human-readable byte size, e.g. "1.4 MB". Returns "—" for invalid input. */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const precision = value >= 100 || unit === 0 ? 0 : 1;
  return `${value.toFixed(precision)} ${units[unit]}`;
}

/**
 * Reads the intrinsic pixel dimensions of an image file. Resolves `null` when
 * the image cannot be decoded (unsupported/invalid file). Never throws — the
 * preview must not block on metadata resolution.
 */
export function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    if (typeof Image === "undefined" || typeof URL.createObjectURL !== "function") {
      resolve(null);
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}
