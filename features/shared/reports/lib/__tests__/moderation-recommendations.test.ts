import { describe, expect, it } from "vitest";

import {
  getRecommendedActions,
  validateActionCombination,
} from "../moderation-recommendations";

describe("getRecommendedActions", () => {
  it("copyright_confirmed — recommends removal (pre-checked), no rerun_plagiarism, and warn/suspend user actions", () => {
    const rec = getRecommendedActions("copyright", "copyright_confirmed");

    // Artwork actions: only remove_artwork, pre-checked. rerun_plagiarism is
    // intentionally not offered in the resolution workflow.
    expect(rec.artworkActions.map((a) => a.action)).toEqual(["remove_artwork"]);
    expect(rec.artworkActions[0].checked).toBe(true);
    expect(
      rec.artworkActions.some((a) => a.action === "rerun_plagiarism"),
    ).toBe(false);

    // User actions: warn (pre-checked) or suspend — strictly one-of in the UI.
    expect(rec.userActions.map((u) => u.action)).toEqual([
      "warn_user",
      "suspend_user",
    ]);
    expect(rec.userActions.find((u) => u.action === "warn_user")?.checked).toBe(
      true,
    );
    expect(
      rec.userActions.find((u) => u.action === "suspend_user")?.checked,
    ).toBe(false);
  });

  it("no_violation — keeps the artwork (pre-checked) with no user actions", () => {
    const rec = getRecommendedActions("copyright", "no_violation");

    expect(rec.artworkActions.map((a) => a.action)).toEqual(["keep_artwork"]);
    expect(rec.artworkActions[0].checked).toBe(true);
    expect(rec.userActions).toEqual([]);
  });

  it("guideline_violation — nudity reports default to mark_nsfw (pre-checked)", () => {
    const rec = getRecommendedActions("nudity", "guideline_violation");

    expect(rec.artworkActions.map((a) => a.action)).toEqual([
      "remove_artwork",
      "mark_nsfw",
    ]);
    expect(
      rec.artworkActions.find((a) => a.action === "remove_artwork")?.checked,
    ).toBe(false);
    expect(
      rec.artworkActions.find((a) => a.action === "mark_nsfw")?.checked,
    ).toBe(true);
  });

  it("guideline_violation — spam reports default to remove_artwork (pre-checked)", () => {
    const rec = getRecommendedActions("spam", "guideline_violation");

    expect(
      rec.artworkActions.find((a) => a.action === "remove_artwork")?.checked,
    ).toBe(true);
    expect(
      rec.artworkActions.find((a) => a.action === "mark_nsfw")?.checked,
    ).toBe(false);
  });

  it("insufficient_evidence — keeps the artwork with no user actions", () => {
    const rec = getRecommendedActions("harassment", "insufficient_evidence");

    expect(rec.artworkActions.map((a) => a.action)).toEqual(["keep_artwork"]);
    expect(rec.artworkActions[0].checked).toBe(true);
    expect(rec.userActions).toEqual([]);
  });
});

describe("validateActionCombination", () => {
  it("accepts a legal copyright_confirmed resolution (remove artwork + one user action)", () => {
    expect(
      validateActionCombination(
        "copyright_confirmed",
        ["remove_artwork"],
        ["warn_user"],
      ),
    ).toEqual({ valid: true });

    expect(
      validateActionCombination(
        "copyright_confirmed",
        ["remove_artwork"],
        ["suspend_user"],
      ),
    ).toEqual({ valid: true });
  });

  it("accepts passive decisions with keep_artwork and no user actions", () => {
    for (const decision of [
      "no_violation",
      "insufficient_evidence",
      "false_report",
    ] as const) {
      expect(validateActionCombination(decision, ["keep_artwork"], [])).toEqual(
        { valid: true },
      );
    }
  });

  it("rejects active artwork actions on passive decisions", () => {
    const result = validateActionCombination(
      "no_violation",
      ["remove_artwork"],
      [],
    );
    expect(result).toMatchObject({ valid: false });
    expect(result.valid === false && result.reason).toContain(
      "does not allow artwork actions",
    );
  });

  it("rejects any user actions on passive decisions", () => {
    const result = validateActionCombination(
      "insufficient_evidence",
      ["keep_artwork"],
      ["warn_user"],
    );
    expect(result).toMatchObject({ valid: false });
    expect(result.valid === false && result.reason).toContain(
      "does not allow user actions",
    );
  });

  it("rejects more than one artwork action (remove_artwork + mark_nsfw together)", () => {
    const result = validateActionCombination(
      "guideline_violation",
      ["remove_artwork", "mark_nsfw"],
      ["warn_user"],
    );
    expect(result).toMatchObject({ valid: false });
    expect(
      result.valid === false && result.reason,
    ).toContain("Only one artwork action can be selected per resolution");
    expect(result.valid === false && result.reason).toContain("remove_artwork, mark_nsfw");
  });

  it("accepts a single artwork action for guideline_violation", () => {
    expect(
      validateActionCombination("guideline_violation", ["remove_artwork"], []),
    ).toEqual({ valid: true });

    expect(
      validateActionCombination("guideline_violation", ["mark_nsfw"], []),
    ).toEqual({ valid: true });
  });

  it("accepts an empty artwork action selection", () => {
    expect(
      validateActionCombination("guideline_violation", [], ["suspend_user"]),
    ).toEqual({ valid: true });
  });

  it("rejects more than one user action (warn + suspend together)", () => {
    const result = validateActionCombination(
      "copyright_confirmed",
      ["remove_artwork"],
      ["warn_user", "suspend_user"],
    );
    expect(result).toMatchObject({ valid: false });
    expect(result.valid === false && result.reason).toContain(
      "Only one user action can be selected per resolution",
    );
  });

  it("rejects all three user actions at once (warn + suspend + ban)", () => {
    const result = validateActionCombination(
      "guideline_violation",
      ["remove_artwork"],
      ["warn_user", "suspend_user", "ban_user"],
    );
    expect(result).toMatchObject({ valid: false });
  });

  it("rejects rerun_plagiarism — not offered in the resolution workflow", () => {
    const result = validateActionCombination(
      "copyright_confirmed",
      ["rerun_plagiarism"],
      [],
    );
    expect(result).toMatchObject({ valid: false });
    expect(result.valid === false && result.reason).toContain(
      "is not allowed for decision",
    );
  });

  it("rejects actions outside the decision's allowed set", () => {
    // ban_user is only allowed for guideline_violation
    const result = validateActionCombination(
      "copyright_confirmed",
      ["remove_artwork"],
      ["ban_user"],
    );
    expect(result).toMatchObject({ valid: false });
    expect(result.valid === false && result.reason).toContain(
      "is not allowed for decision",
    );

    // mark_nsfw is only allowed for guideline_violation
    expect(
      validateActionCombination("copyright_confirmed", ["mark_nsfw"], []),
    ).toMatchObject({ valid: false });
  });

  it("accepts a guideline_violation resolution with a single user action", () => {
    expect(
      validateActionCombination(
        "guideline_violation",
        ["mark_nsfw"],
        ["ban_user"],
      ),
    ).toEqual({ valid: true });
  });
});
