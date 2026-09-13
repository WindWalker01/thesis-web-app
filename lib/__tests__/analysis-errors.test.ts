import { describe, expect, it } from "vitest";

import { describeAnalysisError } from "../analysis-errors";

describe("describeAnalysisError", () => {
  it("maps the Next Server Action transport failure to actionable size guidance", () => {
    const err = new Error(
      "An unexpected response was received from the server.",
    );
    expect(describeAnalysisError(err)).toMatch(/too large/i);
  });

  it("maps network failures to connectivity guidance", () => {
    expect(describeAnalysisError(new TypeError("Failed to fetch"))).toMatch(
      /internet connection/i,
    );
    expect(describeAnalysisError(new TypeError("Load failed"))).toMatch(
      /internet connection/i,
    );
  });

  it("maps timeouts and aborts (incl. DOMException, which is not an Error) to retry guidance", () => {
    const timeout = new DOMException(
      "The operation was aborted due to timeout",
      "TimeoutError",
    );
    expect(describeAnalysisError(timeout)).toMatch(/timed out/i);
    expect(describeAnalysisError(new Error("Request timed out"))).toMatch(
      /timed out/i,
    );
  });

  it("surfaces backend detail messages verbatim", () => {
    const backend = new Error(
      "Server error (500): calibration_config_not_loaded",
    );
    expect(describeAnalysisError(backend)).toBe(backend.message);
  });

  it("falls back to a generic message for non-Error values", () => {
    expect(describeAnalysisError(undefined)).toBe(
      "An unexpected error occurred.",
    );
    expect(describeAnalysisError(null)).toBe("An unexpected error occurred.");
  });
});
