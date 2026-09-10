/** Display labels for the six geometric transform variants reported by the API. */
export const TRANSFORM_LABELS: Record<string, string> = {
  "0": "0° (identity)",
  "90": "90° rotation",
  "180": "180° rotation",
  "270": "270° rotation",
  "mirror": "horizontal mirror",
  "flip": "vertical flip",
};

/** Display labels for the five block regions reported by the API. */
export const BLOCK_LABELS: Record<string, string> = {
  top_left: "Top Left",
  top_right: "Top Right",
  bottom_left: "Bottom Left",
  bottom_right: "Bottom Right",
  center: "Center",
};

/**
 * Parses a scale-prefixed block key (v3 API) into its components.
 * e.g. "0.625:top_left" → { scale: "0.625", region: "top_left" }
 * Returns null for legacy unprefixed keys or invalid formats.
 */
export function parseBlockKey(key: string): { scale: string; region: string } | null {
  const colonIdx = key.indexOf(':');
  if (colonIdx === -1) return null;
  const scale = key.slice(0, colonIdx);
  const region = key.slice(colonIdx + 1);
  if (!scale || !region) return null;
  return { scale, region };
}

/**
 * Formats a block key for display.
 * - Scale-prefixed keys (v3): "0.625:top_left" → "0.625 · Top Left"
 * - Legacy keys (v2): "top_left" → "Top Left"
 * - Unknown keys: returned as-is
 */
export function formatBlockKey(key: string): string {
  const parsed = parseBlockKey(key);
  if (!parsed) return BLOCK_LABELS[key] ?? key;
  const regionLabel = BLOCK_LABELS[parsed.region] ?? parsed.region;
  return `${parsed.scale} · ${regionLabel}`;
}

/**
 * Checks if a block key is scale-prefixed (v3 API format).
 */
export function isScalePrefixedBlockKey(key: string): boolean {
  return key.includes(':');
}
