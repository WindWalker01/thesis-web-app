import { describe, expect, it } from "vitest";

import { formatBlockchainError } from "@/features/public/txs/server/blockchain-error";

/** Builds an ethers.js "could not coalesce error" carrying a raw RPC message. */
function coalescedError(rpcMessage: string): Error {
  const error = new Error("could not coalesce error (…)");
  Object.assign(error, {
    code: "UNKNOWN_ERROR",
    error: { message: rpcMessage },
  });
  return error;
}

describe("formatBlockchainError", () => {
  it("surfaces a friendly message for a temporary RPC error", () => {
    const error = coalescedError(
      "Temporary internal error. Please retry, trace-id: d40f4d9cdd7aec22c78f057f37fe5055",
    );

    const result = formatBlockchainError(error);

    expect(result).toContain("temporary internal error");
    expect(result).not.toContain("could not coalesce");
  });

  it("surfaces the underlying message for other unknown RPC errors", () => {
    const error = coalescedError("some unexpected provider failure");

    expect(formatBlockchainError(error)).toBe(
      "The Polygon Amoy RPC node returned an unexpected error: some unexpected provider failure",
    );
  });

  it("prefers the short message for known ethers errors", () => {
    const error = new Error("insufficient funds (…)");
    Object.assign(error, {
      code: "INSUFFICIENT_FUNDS",
      shortMessage: "insufficient funds for intrinsic transaction cost",
    });

    expect(formatBlockchainError(error)).toBe(
      "insufficient funds for intrinsic transaction cost",
    );
  });

  it("falls back to the raw message for a plain Error", () => {
    expect(formatBlockchainError(new Error("boom"))).toBe("boom");
  });

  it("returns a fallback for non-Error values", () => {
    expect(formatBlockchainError("oops")).toBe("Blockchain registration failed.");
    expect(formatBlockchainError(null)).toBe("Blockchain registration failed.");
    expect(formatBlockchainError(undefined)).toBe(
      "Blockchain registration failed.",
    );
  });
});
