import { describe, expect, it } from "vitest";
import {
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
});
