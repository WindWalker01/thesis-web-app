import { describe, expect, it } from "vitest";

import { licenseIdentifierSchema } from "./artwork-license-schema";
import { DEFAULT_LICENSE_ID } from "./licenses";

describe("licenseIdentifierSchema", () => {
  it("accepts every supported identifier", () => {
    for (const id of [
      "all-rights-reserved",
      "cc-by",
      "cc-by-sa",
      "cc-by-nc",
      "cc-by-nc-sa",
      "cc-by-nd",
      "cc-by-nc-nd",
    ]) {
      expect(licenseIdentifierSchema.safeParse(id).success).toBe(true);
    }
  });

  it("rejects invalid identifiers", () => {
    const result = licenseIdentifierSchema.safeParse("cc-by-fake");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBeTruthy();
    }
  });

  it("rejects non-string values", () => {
    expect(licenseIdentifierSchema.safeParse(undefined).success).toBe(false);
    expect(licenseIdentifierSchema.safeParse(null).success).toBe(false);
    expect(licenseIdentifierSchema.safeParse(42).success).toBe(false);
  });

  it("defaults to All Rights Reserved when chained with default", () => {
    const withDefault = licenseIdentifierSchema.default(DEFAULT_LICENSE_ID);
    expect(withDefault.parse(undefined)).toBe("all-rights-reserved");
  });
});