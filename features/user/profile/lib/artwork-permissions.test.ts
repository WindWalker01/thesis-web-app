import { describe, expect, it } from "vitest";

import {
  canRetryBlockchain,
  hasBlockchainRecord,
} from "./artwork-permissions";

describe("hasBlockchainRecord", () => {
  it("detects any persisted blockchain identifier", () => {
    expect(hasBlockchainRecord({ txHash: "0xabc" })).toBe(true);
    expect(hasBlockchainRecord({ workId: "1" })).toBe(true);
    expect(hasBlockchainRecord({ blockNumber: 42 })).toBe(true);
    expect(hasBlockchainRecord({ chain: "amoy" })).toBe(true);
    expect(hasBlockchainRecord({})).toBe(false);
  });
});

describe("canRetryBlockchain", () => {
  it("allows retry for pending_blockchain and blockchain_failed without a record", () => {
    expect(canRetryBlockchain({ status: "pending_blockchain" })).toBe(true);
    expect(canRetryBlockchain({ status: "blockchain_failed" })).toBe(true);
  });

  it("rejects non-retryable statuses", () => {
    for (const status of [
      "active",
      "flagged",
      "under_review",
      "removed",
      "revoked",
    ]) {
      expect(canRetryBlockchain({ status })).toBe(false);
    }
  });

  it("rejects artworks that already have a blockchain record", () => {
    expect(
      canRetryBlockchain({ status: "blockchain_failed", txHash: "0xabc" })
    ).toBe(false);
    expect(
      canRetryBlockchain({ status: "pending_blockchain", workId: "1" })
    ).toBe(false);
  });
});
