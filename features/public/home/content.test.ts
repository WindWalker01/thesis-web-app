import { describe, expect, it } from "vitest";
import {
  HOME_FAQS,
  PLATFORM_FEATURES,
  PRODUCT_STACK_STEPS,
  TEAM_MEMBERS,
  closingCtaLabel,
  heroCtaLabel,
  homeSignupHref,
  initialOpenFaqIndex,
} from "@/features/public/home/content";

describe("home content", () => {
  it("opens the first FAQ by default", () => {
    expect(initialOpenFaqIndex(HOME_FAQS)).toBe(0);
  });

  it("returns null when no FAQ is marked open", () => {
    expect(initialOpenFaqIndex([{}])).toBeNull();
  });

  it("sends guests to register and signed-in artists to upload", () => {
    expect(homeSignupHref(false)).toBe("/register");
    expect(homeSignupHref(true)).toBe("/upload-artwork");
    expect(heroCtaLabel(false)).toBe("Sign Up");
    expect(heroCtaLabel(true)).toBe("Upload Artwork");
    expect(closingCtaLabel(false)).toBe("Get Started");
    expect(closingCtaLabel(true)).toBe("Upload Artwork");
  });

  it("keeps the public feature and team lists complete", () => {
    expect(PLATFORM_FEATURES).toHaveLength(6);
    expect(TEAM_MEMBERS.map((member) => member.name)).toEqual([
      "Ruzzel",
      "Tenshin",
      "Nathaniel",
    ]);
    expect(HOME_FAQS).toHaveLength(6);
    expect(PRODUCT_STACK_STEPS.map((step) => step.title)).toEqual([
      "Upload",
      "Fingerprints",
      "On-chain record",
      "Monitor",
    ]);
    expect(PRODUCT_STACK_STEPS.map((step) => step.href)).toEqual([
      "/upload-artwork",
      "/plagiarism-checker",
      "/txs",
      "/dashboard",
    ]);
  });
});
