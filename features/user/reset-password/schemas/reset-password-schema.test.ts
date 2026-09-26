import { describe, expect, it } from "vitest";

import {
  OTP_MAX_LENGTH,
  OTP_MIN_LENGTH,
  recoveryEmailSchema,
  recoveryOtpSchema,
} from "./reset-password-schema";

describe("recoveryOtpSchema", () => {
  it("accepts a 6-digit OTP", () => {
    const result = recoveryOtpSchema.safeParse({ token: "123456" });
    expect(result.success).toBe(true);
  });

  it("accepts an 8-digit OTP", () => {
    const result = recoveryOtpSchema.safeParse({ token: "12345678" });
    expect(result.success).toBe(true);
  });

  it("rejects tokens shorter than the minimum length", () => {
    const result = recoveryOtpSchema.safeParse({
      token: "1".repeat(OTP_MIN_LENGTH - 1),
    });
    expect(result.success).toBe(false);
  });

  it("rejects tokens longer than the maximum length", () => {
    const result = recoveryOtpSchema.safeParse({
      token: "1".repeat(OTP_MAX_LENGTH + 1),
    });
    expect(result.success).toBe(false);
  });

  it("rejects tokens containing non-numeric characters", () => {
    expect(recoveryOtpSchema.safeParse({ token: "12345a" }).success).toBe(false);
    expect(recoveryOtpSchema.safeParse({ token: "1234-678" }).success).toBe(
      false,
    );
  });

  it("rejects an empty token", () => {
    expect(recoveryOtpSchema.safeParse({ token: "" }).success).toBe(false);
  });
});

describe("recoveryEmailSchema", () => {
  it("accepts a valid email", () => {
    expect(
      recoveryEmailSchema.safeParse({ email: "user@example.com" }).success,
    ).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(
      recoveryEmailSchema.safeParse({ email: "not-an-email" }).success,
    ).toBe(false);
  });

  it("rejects an empty email", () => {
    expect(recoveryEmailSchema.safeParse({ email: "" }).success).toBe(false);
  });
});
