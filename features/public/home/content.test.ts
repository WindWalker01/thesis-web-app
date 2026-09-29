import { describe, expect, it } from "vitest";
import {
  HOME_CTA,
  HOME_DISCLAIMER,
  HOME_FAQS,
  initialOpenFaqIndex,
  PRODUCT_STACK_STEPS,
  TEAM_MEMBERS,
} from "@/features/public/home/content";

describe("home content", () => {
  it("keeps the product path steps complete", () => {
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
    expect(PRODUCT_STACK_STEPS.map((step) => step.image)).toEqual([
      "/landing-page-elements/upload-artwork.png",
      "/landing-page-elements/similiarity-checking.png",
      "/landing-page-elements/on-chain-record.png",
      "/landing-page-elements/dashboard.png",
    ]);
  });

  it("lists the research team and keeps portfolio links optional", () => {
    expect(TEAM_MEMBERS.map((member) => member.name)).toEqual([
      "Ruzzel",
      "Tenshin",
      "Nathaniel",
    ]);
    expect(TEAM_MEMBERS.map((member) => member.portfolio ?? null)).toEqual([
      "https://ruzzel.vercel.app",
      "https://tenshinponteres.dev",
      null,
    ]);
  });

  it("starts the FAQ on the registration question", () => {
    expect(HOME_FAQS).toHaveLength(6);
    expect(initialOpenFaqIndex(HOME_FAQS)).toBe(0);
    expect(initialOpenFaqIndex([{ q: "Closed" }])).toBeNull();
  });

  it("keeps the closing disclaimer and call to action", () => {
    expect(HOME_DISCLAIMER.body).toMatch(/undergraduate thesis/i);
    expect(HOME_DISCLAIMER.body).toMatch(/IPOPHL/);
    expect(HOME_DISCLAIMER.body).toMatch(/does not grant copyright/i);
    expect(HOME_DISCLAIMER.body).toMatch(/legal infringement/i);
    expect(HOME_CTA.primarySignedOut).toEqual({
      label: "GET STARTED",
      href: "/register",
    });
    expect(HOME_CTA.primarySignedIn.href).toBe("/upload-artwork");
    expect(HOME_CTA.secondary.href).toBe("/about");
  });
});
