import { describe, expect, it } from "vitest";

import {
  DEFAULT_LICENSE_ID,
  findLicense,
  getLicense,
  isLicenseIdentifier,
  LICENSES,
  LICENSE_IDS,
  permissionChecklist,
  resolveLicense,
} from "./licenses";

describe("LICENSES catalog", () => {
  it("exposes exactly the seven supported licenses, no more", () => {
    expect(LICENSE_IDS).toEqual([
      "all-rights-reserved",
      "cc-by",
      "cc-by-sa",
      "cc-by-nc",
      "cc-by-nc-sa",
      "cc-by-nd",
      "cc-by-nc-nd",
    ]);
    expect(LICENSES.map((l) => l.id)).toEqual([...LICENSE_IDS]);
  });

  it("uses All Rights Reserved as the default", () => {
    expect(DEFAULT_LICENSE_ID).toBe("all-rights-reserved");
  });

  it("gives every CC license an official URL and descriptive name", () => {
    for (const license of LICENSES) {
      if (license.type === "creative_commons") {
        expect(license.url).toMatch(/^https:\/\/creativecommons\.org\/licenses\//);
        expect(license.name).toMatch(/Creative Commons .+\(CC /);
      }
    }
  });

  it("keeps All Rights Reserved fully restricted", () => {
    const arr = resolveLicense("all-rights-reserved");
    expect(arr.permissions).toMatchObject({
      share: false,
      adapt: false,
      commercial: false,
      permissionRequired: true,
    });
  });

  it("defaults unknown or missing identifiers to All Rights Reserved", () => {
    expect(resolveLicense(null).id).toBe("all-rights-reserved");
    expect(resolveLicense(undefined).id).toBe("all-rights-reserved");
    expect(resolveLicense("cc-by-nc")).not.toBe("cc-by-nc");
  });
});

describe("lookup helpers", () => {
  it("finds a license by identifier", () => {
    expect(findLicense("cc-by-nc-sa")?.shortHandle).toBe("CC BY-NC-SA 4.0");
  });

  it("is case/space tolerant when looking up", () => {
    expect(findLicense("  CC-BY-NC  ")).toBeTruthy();
  });

  it("rejects truly unknown values", () => {
    expect(findLicense("cc-by-woops")).toBeNull();
    expect(findLicense("")).toBeNull();
    expect(findLicense(42 as unknown as string)).toBeNull();
  });

  it("stays case/space tolerant for the guard", () => {
    expect(isLicenseIdentifier("cc-by")).toBe(true);
    expect(isLicenseIdentifier("  CC-BY  ")).toBe(true);
    expect(isLicenseIdentifier("cc-by-bogus")).toBe(false);
    expect(isLicenseIdentifier(undefined)).toBe(false);
  });

  it("throws for unknown identifiers on the strict read path", () => {
    expect(() => getLicense("not-a-license")).toThrow(/Unsupported license/);
  });

  it("neutralizes the default for no-op comparisons", () => {
    // resolveLicense never returns null, so the fallback is always safe for
    // display even when a persisted record holds a bad value.
    expect(resolveLicense("mystery").id).toBe("all-rights-reserved");
  });
});

describe("permissionChecklist", () => {
  it("produces a checklist entry per supported permission key", () => {
    const rows = permissionChecklist(resolveLicense("cc-by"));
    expect(rows.map((r) => r.key)).toEqual([
      "share",
      "adapt",
      "commercial",
      "attribution",
    ]);
  });

  it("reflects NC and ND restrictions", () => {
    const nc = permissionChecklist(resolveLicense("cc-by-nc"));
    expect(nc.find((r) => r.key === "commercial")?.allowed).toBe(false);

    const nd = permissionChecklist(resolveLicense("cc-by-nd"));
    expect(nd.find((r) => r.key === "adapt")?.allowed).toBe(false);
  });
});