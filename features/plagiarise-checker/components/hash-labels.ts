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
