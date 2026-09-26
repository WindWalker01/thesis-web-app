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
};

export function savePendingMatchAction(value: PendingMatchAction): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
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
