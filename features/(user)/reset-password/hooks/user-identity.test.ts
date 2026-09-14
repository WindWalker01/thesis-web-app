import { describe, expect, it } from "vitest";

import { isOAuthOnlyUser } from "./user-identity";

describe("isOAuthOnlyUser", () => {
  it("returns true for a Google-only user identified by identities", () => {
    expect(
      isOAuthOnlyUser({
        app_metadata: { provider: "google" },
        identities: [{ provider: "google" }],
      }),
    ).toBe(true);
  });

  it("returns false for a user with a password (email identity)", () => {
    expect(
      isOAuthOnlyUser({
        app_metadata: { provider: "email" },
        identities: [{ provider: "email" }],
      }),
    ).toBe(false);
  });

  it("returns false for a linked account with both Google and password", () => {
    expect(
      isOAuthOnlyUser({
        app_metadata: { provider: "google" },
        identities: [{ provider: "google" }, { provider: "email" }],
      }),
    ).toBe(false);
  });

  it("falls back to app_metadata when identities is missing", () => {
    expect(isOAuthOnlyUser({ app_metadata: { provider: "google" } })).toBe(true);
    expect(isOAuthOnlyUser({ app_metadata: { provider: "email" } })).toBe(false);
  });

  it("falls back to app_metadata when identities is empty", () => {
    expect(
      isOAuthOnlyUser({ app_metadata: { provider: "google" }, identities: [] }),
    ).toBe(true);
  });

  it("returns false for null or empty users", () => {
    expect(isOAuthOnlyUser(null)).toBe(false);
    expect(isOAuthOnlyUser({})).toBe(false);
  });
});
