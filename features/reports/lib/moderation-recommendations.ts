// ============================================
// Moderation Recommendations — Business Logic
// ============================================
// Generates recommended actions and validates action
// combinations for the report resolution workflow.
// Used by both frontend (ResolutionCard) and backend (resolve_report route).
// ============================================

import type {
  ReportType,
  ReportDecisionValue,
  ActionRecommendation,
  ReportStatus,
} from "@/features/reports/types";

// ---- Decision → Allowed Artwork Actions ----

export const DECISION_ARTWORK_ACTIONS: Record<
  ReportDecisionValue,
  ("keep_artwork" | "remove_artwork" | "restore_artwork" | "mark_nsfw" | "rerun_plagiarism")[]
> = {
  no_violation: ["keep_artwork"],
  copyright_confirmed: ["remove_artwork", "rerun_plagiarism"],
  guideline_violation: ["remove_artwork", "mark_nsfw"],
  insufficient_evidence: ["keep_artwork"],
  false_report: ["keep_artwork"],
};

// ---- Decision → Allowed User Actions ----

export const DECISION_USER_ACTIONS: Record<
  ReportDecisionValue,
  ("warn_user" | "suspend_user" | "ban_user")[]
> = {
  no_violation: [],
  copyright_confirmed: ["warn_user", "suspend_user"],
  guideline_violation: ["warn_user", "suspend_user", "ban_user"],
  insufficient_evidence: [],
  false_report: [],
};

// ---- Guideline Violation → Artwork Defaults by Report Type ----

export const GUIDELINE_ARTWORK_DEFAULTS: Record<
  Exclude<ReportType, "copyright" | "other">,
  ("remove_artwork" | "mark_nsfw")[]
> = {
  spam: ["remove_artwork"],
  harassment: ["remove_artwork"],
  nudity: ["mark_nsfw"],
  violence: ["remove_artwork"],
  hate: ["remove_artwork"],
};

// ---- Status Transition Validation ----

export const VALID_STATUS_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  pending_review: ["under_review"],
  under_review: ["resolved"],
  resolved: [],
};

// ---- Action Labels ----

const ARTWORK_ACTION_LABELS: Record<string, string> = {
  keep_artwork: "Keep Artwork",
  remove_artwork: "Remove Artwork",
  restore_artwork: "Restore Artwork",
  mark_nsfw: "Mark as NSFW",
  rerun_plagiarism: "Re-run Plagiarism Scan",
};

const USER_ACTION_LABELS: Record<string, string> = {
  warn_user: "Issue Warning",
  suspend_user: "Suspend Account",
  ban_user: "Ban Account",
};

// ---- Recommendation Generator ----

/**
 * Generates recommended actions for a given report_type and decision.
 * Returns the actions that should be pre-checked in the UI.
 */
export function getRecommendedActions(
  reportType: ReportType,
  decision: ReportDecisionValue
): ActionRecommendation {
  const artworkActions: ActionRecommendation["artworkActions"] = [];
  const userActions: ActionRecommendation["userActions"] = [];

  // Artwork actions — use type-safe lookup with fallback
  const allowedArtwork: ("keep_artwork" | "remove_artwork" | "restore_artwork" | "mark_nsfw" | "rerun_plagiarism")[] =
    decision in DECISION_ARTWORK_ACTIONS
      ? DECISION_ARTWORK_ACTIONS[decision as keyof typeof DECISION_ARTWORK_ACTIONS]
      : ["keep_artwork"];

  for (const action of allowedArtwork) {
    const isGuidelineViolation = decision === "guideline_violation";
    const defaults =
      isGuidelineViolation && reportType !== "copyright" && reportType !== "other"
        ? GUIDELINE_ARTWORK_DEFAULTS[reportType as keyof typeof GUIDELINE_ARTWORK_DEFAULTS]
        : [];

    let checked = false;
    if (decision === "copyright_confirmed" && action === "remove_artwork") {
      checked = true;
    } else if (isGuidelineViolation && defaults.includes(action as "remove_artwork" | "mark_nsfw")) {
      checked = true;
    } else if (decision === "no_violation" || decision === "insufficient_evidence") {
      checked = true;
    }

    artworkActions.push({
      action: action as ActionRecommendation["artworkActions"][number]["action"],
      label: ARTWORK_ACTION_LABELS[action] ?? action,
      checked,
    });
  }

  // User actions — use type-safe lookup with fallback
  const allowedUser: ("warn_user" | "suspend_user" | "ban_user")[] =
    decision in DECISION_USER_ACTIONS
      ? DECISION_USER_ACTIONS[decision as keyof typeof DECISION_USER_ACTIONS]
      : [];

  for (const action of allowedUser) {
    let checked = false;
    if (decision === "copyright_confirmed" && action === "warn_user") {
      checked = true;
    } else if (decision === "guideline_violation" && action === "warn_user") {
      checked = true;
    }

    userActions.push({
      action: action as ActionRecommendation["userActions"][number]["action"],
      label: USER_ACTION_LABELS[action] ?? action,
      checked,
    });
  }

  return { artworkActions, userActions };
}

// ---- Server-Side Validation ----

export type CombinationValidationResult =
  | { valid: true }
  | { valid: false; reason: string };

/**
 * Validates that the selected decision, artwork actions, and user actions
 * form a legal combination. This runs server-side for security.
 */
export function validateActionCombination(
  decision: ReportDecisionValue,
  artworkActions: string[],
  userActions: string[]
): CombinationValidationResult {
  // Decisions that allow NO modifications
  const passiveDecisions: ReportDecisionValue[] = ["no_violation", "insufficient_evidence", "false_report"];

  if (passiveDecisions.includes(decision)) {
    const activeArtwork = artworkActions.filter((a) => a !== "keep_artwork");
    if (activeArtwork.length > 0) {
      return {
        valid: false,
        reason: `Decision "${decision}" does not allow artwork actions: ${activeArtwork.join(", ")}.`,
      };
    }
    if (userActions.length > 0) {
      return {
        valid: false,
        reason: `Decision "${decision}" does not allow user actions: ${userActions.join(", ")}.`,
      };
    }
  }

  // Validate each action is in the allowed set
  const allowedArtwork = DECISION_ARTWORK_ACTIONS[decision] ?? ["keep_artwork"];
  for (const action of artworkActions) {
    if (!allowedArtwork.includes(action as typeof allowedArtwork[number])) {
      return {
        valid: false,
        reason: `Artwork action "${action}" is not allowed for decision "${decision}". Allowed: ${allowedArtwork.join(", ")}.`,
      };
    }
  }

  const allowedUser = DECISION_USER_ACTIONS[decision] ?? [];
  for (const action of userActions) {
    if (!allowedUser.includes(action as typeof allowedUser[number])) {
      return {
        valid: false,
        reason: `User action "${action}" is not allowed for decision "${decision}". Allowed: ${allowedUser.join(", ") || "none"}.`,
      };
    }
  }

  return { valid: true };
}
