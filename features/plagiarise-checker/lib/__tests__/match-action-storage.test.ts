import { beforeEach, describe, expect, it } from "vitest";
import {
  savePendingMatchAction,
  loadPendingMatchAction,
  clearPendingMatchAction,
} from "../match-action-storage";
import type { PlagiarismMatchContext } from "../match-source";

const context: PlagiarismMatchContext = {
  origin: "internal",
  matchedArtworkId: "11111111-1111-4111-8111-111111111111",
  matchedArtworkTitle: "Sunset",
  matchedArtworkUrl: "/community/post-1",
  externalUrl: null,
  externalSource: null,
  similarity: 90,
  originalHash: "0xabc",
  scanId: null,
};

describe("match-action-storage", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("round-trips a pending action through sessionStorage", () => {
    savePendingMatchAction({ action: "report", context, filename: "art.png" });

    const loaded = loadPendingMatchAction();
    expect(loaded).toEqual({
      action: "report",
      context,
      filename: "art.png",
    });
  });

  it("returns null when nothing is stored", () => {
    expect(loadPendingMatchAction()).toBeNull();
  });

  it("clears the stored action", () => {
    savePendingMatchAction({ action: "review", context, filename: null });
    clearPendingMatchAction();
    expect(loadPendingMatchAction()).toBeNull();
  });

  it("ignores malformed payloads", () => {
    window.sessionStorage.setItem("plagiarism-pending-action", "not-json");
    expect(loadPendingMatchAction()).toBeNull();
  });
});
