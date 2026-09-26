import { describe, it, expect } from "vitest";
import {
  getCommunityRecognitionBadge,
  getBadgeLabel,
  getBadgeIconName,
  validateBadgeThresholds,
  type BadgeThresholds,
  type CommunityRecognitionBadge,
  DEFAULT_BADGE_THRESHOLDS,
} from "./index";

describe("getCommunityRecognitionBadge", () => {
  it("returns 'Emerging' for scores below Recognized threshold", () => {
    const result = getCommunityRecognitionBadge(0);
    expect(result).toBe("Emerging");
  });

  it("returns 'Recognized' for scores at Recognized threshold (5)", () => {
    const result = getCommunityRecognitionBadge(5);
    expect(result).toBe("Recognized");
  });

  it("returns 'Recognized' for scores between Recognized and Acclaimed", () => {
    const result = getCommunityRecognitionBadge(6);
    expect(result).toBe("Recognized");
  });

  it("returns 'Acclaimed' for scores at Acclaimed threshold (8)", () => {
    const result = getCommunityRecognitionBadge(8);
    expect(result).toBe("Acclaimed");
  });

  it("returns 'Acclaimed' for scores between Acclaimed and Master", () => {
    const result = getCommunityRecognitionBadge(9);
    expect(result).toBe("Acclaimed");
  });

  it("returns 'Master' for scores at Master threshold (11)", () => {
    const result = getCommunityRecognitionBadge(11);
    expect(result).toBe("Master");
  });

  it("returns 'Master' for scores above Master threshold", () => {
    const result = getCommunityRecognitionBadge(100);
    expect(result).toBe("Master");
  });

  it("uses custom thresholds when provided", () => {
    const customThresholds: BadgeThresholds = {
      Recognized: 3,
      Acclaimed: 6,
      Master: 10,
    };
    expect(getCommunityRecognitionBadge(2, customThresholds)).toBe("Emerging");
    expect(getCommunityRecognitionBadge(4, customThresholds)).toBe(
      "Recognized",
    );
    expect(getCommunityRecognitionBadge(7, customThresholds)).toBe("Acclaimed");
    expect(getCommunityRecognitionBadge(12, customThresholds)).toBe("Master");
  });
});

describe("getBadgeLabel", () => {
  it("returns correct label for each tier", () => {
    expect(getBadgeLabel("Emerging")).toBe("Emerging");
    expect(getBadgeLabel("Recognized")).toBe("Recognized");
    expect(getBadgeLabel("Acclaimed")).toBe("Acclaimed");
    expect(getBadgeLabel("Master")).toBe("Master");
  });
});

describe("getBadgeIconName", () => {
  it("returns icon name for Recognized", () => {
    expect(getBadgeIconName("Recognized")).toBe("Star");
  });

  it("returns icon name for Acclaimed", () => {
    expect(getBadgeIconName("Acclaimed")).toBe("Award");
  });

  it("returns icon name for Master", () => {
    expect(getBadgeIconName("Master")).toBe("Crown");
  });

  it("returns null for Emerging (no icon)", () => {
    expect(getBadgeIconName("Emerging")).toBeNull();
  });
});

describe("validateBadgeThresholds", () => {
  it("returns true for valid thresholds in ascending order", () => {
    const result = validateBadgeThresholds({
      Recognized: 5,
      Acclaimed: 8,
      Master: 11,
    });
    expect(result).toBe(true);
  });

  it("returns false for thresholds not in ascending order", () => {
    const result = validateBadgeThresholds({
      Recognized: 8,
      Acclaimed: 5,
      Master: 11,
    });
    expect(result).toBe(false);
  });

  it("returns false for Recognized >= Acclaimed", () => {
    const result = validateBadgeThresholds({
      Recognized: 5,
      Acclaimed: 5,
      Master: 11,
    });
    expect(result).toBe(false);
  });

  it("returns false for Acclaimed >= Master", () => {
    const result = validateBadgeThresholds({
      Recognized: 5,
      Acclaimed: 8,
      Master: 8,
    });
    expect(result).toBe(false);
  });
});

describe("DEFAULT_BADGE_THRESHOLDS", () => {
  it("has correct default values matching artist-reputation.ts", () => {
    expect(DEFAULT_BADGE_THRESHOLDS).toEqual({
      Recognized: 5,
      Acclaimed: 8,
      Master: 11,
    });
  });
});
