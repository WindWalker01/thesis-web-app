import { describe, expect, it } from "vitest";
import { isGatewayTimeoutError } from "./connection-issue";

describe("isGatewayTimeoutError", () => {
  it("matches HTTP gateway status codes", () => {
    for (const status of [502, 503, 504, 522, 524, 529]) {
      expect(isGatewayTimeoutError({ status })).toBe(true);
      expect(isGatewayTimeoutError({ statusCode: status })).toBe(true);
    }
  });

  it("does not match application-level HTTP errors", () => {
    expect(isGatewayTimeoutError({ status: 400 })).toBe(false);
    expect(isGatewayTimeoutError({ status: 401 })).toBe(false);
    expect(isGatewayTimeoutError({ status: 404 })).toBe(false);
    expect(isGatewayTimeoutError({ status: 500 })).toBe(false);
  });

  it("matches timeout/gateway message text", () => {
    expect(isGatewayTimeoutError(new Error("Gateway Timeout"))).toBe(true);
    expect(
      isGatewayTimeoutError(
        new Error("Request failed with status code 504 after 150s"),
      ),
    ).toBe(true);
    expect(isGatewayTimeoutError(new Error("Request timed out"))).toBe(true);
    expect(isGatewayTimeoutError("ETIMEDOUT")).toBe(true);
    expect(isGatewayTimeoutError("Failed to fetch")).toBe(true);
  });

  it("does not match unrelated messages or PostgREST codes", () => {
    expect(isGatewayTimeoutError(new Error("Invalid email format"))).toBe(
      false,
    );
    expect(isGatewayTimeoutError({ code: "PGRST116" })).toBe(false);
    expect(isGatewayTimeoutError({ code: "23505" })).toBe(false);
  });

  it("matches network-level failure types", () => {
    expect(isGatewayTimeoutError(new TypeError("Failed to fetch"))).toBe(true);
  });

  it("does not match DOMExceptions that are not abort/timeout", () => {
    // jsdom lacks DOMException constructor args typing; build one manually
    const denied = Object.create(
      Object.getPrototypeOf(new Error("nope")),
    ) as Error;
    Object.defineProperty(denied, "name", { value: "SecurityError" });
    expect(isGatewayTimeoutError(denied)).toBe(false);
  });

  it("unwraps wrapped causes", () => {
    const wrapped = new Error("Upload failed", {
      cause: { status: 504 },
    });
    expect(isGatewayTimeoutError(wrapped)).toBe(true);
  });

  it("returns false for nullish input", () => {
    expect(isGatewayTimeoutError(null)).toBe(false);
    expect(isGatewayTimeoutError(undefined)).toBe(false);
  });
});
