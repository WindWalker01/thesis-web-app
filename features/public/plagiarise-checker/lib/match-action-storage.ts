import type { PlagiarismMatchContext } from "./match-source";

/**
 * Client-only storage for the pending plagiarism match action, used to preserve
 * the selected match/action across the authentication round-trip. The context
 * is fully serialisable (no File bytes), so it survives sessionStorage.
 */

const STORAGE_KEY = "plagiarism-pending-action";

export type PendingMatchAction = {
  /** "report" (internal) or "review" (external). */
  action: "report" | "review";
  context: PlagiarismMatchContext;
  /** Filename of the artwork being checked (for the reviewer context). */
  filename: string | null;
  /**
   * Reporter's own statement for a copyright report. Persisted so the text is
   * restored (prefilled) after the authentication round-trip instead of being
   * lost when the user signs in.
   */
  proof?: string;
  /** Optional extra context for a copyright report. */
  details?: string;
  /**
   * Small JPEG data URL of the reporter's uploaded artwork, captured before the
   * authentication round-trip so the restored modal can show what is being
   * reported. A `File` cannot be serialised, so this is a downscaled copy
   * (see `image-preview.ts`); it is dropped if it would exceed the storage
   * quota, because the reporter's text matters more than the thumbnail.
   */
  originalPreviewDataUrl?: string;
};

export function savePendingMatchAction(value: PendingMatchAction): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Quota exceeded (the preview is the likely culprit): retry without the
    // image so the reporter's proof/details are never lost. A `File` cannot be
    // re-attached later, so the report simply goes in without the artwork.
    if (value.originalPreviewDataUrl) {
      try {
        const rest = (({ originalPreviewDataUrl, ...r }: PendingMatchAction) => {
          void originalPreviewDataUrl;
          return r;
        })(value);
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
        return;
      } catch {
        // Fall through to the silent failure below.
      }
    }
    // Storage unavailable (private mode, quota) — fail silently; the user can
    // simply re-run the analysis after signing in.
  }
}

export function loadPendingMatchAction(): PendingMatchAction | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingMatchAction;
    if (
      (parsed.action === "report" || parsed.action === "review") &&
      parsed.context &&
      typeof parsed.context === "object"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearPendingMatchAction(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}
