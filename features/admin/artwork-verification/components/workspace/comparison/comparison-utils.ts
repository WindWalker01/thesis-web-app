/**
 * Utility functions for the artwork comparison viewer.
 */

/**
 * Validates that a URL string is a usable HTTP(S) URL.
 */
export function isValidImageUrl(url: string | null): url is string {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Preloads an image and returns a promise that resolves when loaded.
 * Rejects if the image fails to load.
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Clamps a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Formats a similarity percentage for display.
 */
export function formatSimilarity(value: number | null): string {
  if (value === null) return "N/A";
  return `${value.toFixed(1)}%`;
}

/**
 * Calculates the fit scale to contain an image within a container
 * while maintaining aspect ratio.
 */
export function calculateFitScale(
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number
): number {
  const scaleX = containerWidth / imageWidth;
  const scaleY = containerHeight / imageHeight;
  return Math.min(scaleX, scaleY, 1); // Don't upscale beyond 1
}

/**
 * Generates a unique ID for ARIA attributes.
 */
let idCounter = 0;
export function uniqueId(prefix = "cmp"): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}