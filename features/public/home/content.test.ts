import { describe, expect, it } from "vitest";
import { PRODUCT_STACK_STEPS } from "@/features/public/home/content";

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
});
