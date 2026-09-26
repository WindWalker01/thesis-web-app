import { describe, expect, it } from "vitest";
import {
  isInternalMatch,
  isExternalMatch,
  buildMatchContext,
} from "../match-source";
import type { SearchMatch } from "../../types";

const dbMatch = (overrides: Partial<SearchMatch> = {}): SearchMatch => ({
  type: "database",
  source: "Registered Artwork",
  url: "11111111-1111-4111-8111-111111111111",
  similarity: 92.5,
  title: "Sunset",
  imageUrl: "https://res.cloudinary.com/x/image/upload/sunset.png",
  communityUrl: "/community/post-1",
  ...overrides,
});

const webMatch = (overrides: Partial<SearchMatch> = {}): SearchMatch => ({
  type: "internet",
  source: "Google Images",
  url: "https://example.com/art.png",
  link: "https://example.com/page",
  similarity: 78,
  ...overrides,
});

describe("match-source", () => {
  it("classifies database matches as internal and internet matches as external", () => {
    expect(isInternalMatch(dbMatch())).toBe(true);
    expect(isExternalMatch(dbMatch())).toBe(false);
    expect(isInternalMatch(webMatch())).toBe(false);
    expect(isExternalMatch(webMatch())).toBe(true);
  });

  it("treats null/undefined as non-internal", () => {
    expect(isInternalMatch(null)).toBe(false);
    expect(isExternalMatch(undefined)).toBe(false);
  });

  it("builds an internal match context with the matched artwork id/url", () => {
    const ctx = buildMatchContext(dbMatch(), { originalHash: "0xabc", scanId: null });
    expect(ctx).toMatchObject({
      origin: "internal",
      matchedArtworkId: "11111111-1111-4111-8111-111111111111",
      matchedArtworkTitle: "Sunset",
      matchedArtworkUrl: "/community/post-1",
      externalUrl: null,
      similarity: 92.5,
      originalHash: "0xabc",
    });
  });

  it("builds an external match context with the external url and source", () => {
    const ctx = buildMatchContext(webMatch());
    expect(ctx).toMatchObject({
      origin: "external",
      matchedArtworkId: null,
      externalUrl: "https://example.com/page",
      externalSource: "Google Images",
      similarity: 78,
    });
  });

  it("returns null for a null match", () => {
    expect(buildMatchContext(null)).toBeNull();
  });
});
