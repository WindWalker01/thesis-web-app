import { describe, expect, it } from "vitest";

import {
  buildArtworkInquiryMailto,
  EMPTY_MESSAGE_ERROR,
  formatArtistDisplayName,
  MAX_INQUIRY_LENGTH,
  validateInquiryMessage,
} from "../inquiry";

describe("validateInquiryMessage", () => {
  it("accepts a normal message and trims surrounding whitespace", () => {
    const result = validateInquiryMessage("  Hello, is this available?  ");
    expect(result).toEqual({
      valid: true,
      message: "Hello, is this available?",
    });
  });

  it("rejects an empty message", () => {
    const result = validateInquiryMessage("");
    expect(result).toEqual({ valid: false, error: EMPTY_MESSAGE_ERROR });
  });

  it("rejects a whitespace-only message", () => {
    const result = validateInquiryMessage("   \n\t  ");
    expect(result).toEqual({ valid: false, error: EMPTY_MESSAGE_ERROR });
  });

  it("rejects messages beyond the maximum length", () => {
    const result = validateInquiryMessage("a".repeat(MAX_INQUIRY_LENGTH + 1));
    expect(result.valid).toBe(false);
    expect(result.valid === false && result.error).toContain("too long");
  });

  it("accepts a message at exactly the maximum length", () => {
    const result = validateInquiryMessage("a".repeat(MAX_INQUIRY_LENGTH));
    expect(result.valid).toBe(true);
  });
});

describe("buildArtworkInquiryMailto", () => {
  const baseInput = {
    artistEmail: "artist@example.com",
    artistName: "Juan Dela Cruz",
    artworkTitle: "Sunset over Manila",
    message: "Is the original still available?",
  };

  it("targets the artist email with the correct subject", () => {
    const url = buildArtworkInquiryMailto(baseInput);
    expect(url.startsWith("mailto:artist@example.com?")).toBe(true);
    expect(url).toContain(
      `subject=${encodeURIComponent("Artwork Inquiry: Sunset over Manila")}`,
    );
  });

  it("builds the expected greeting, interest line, message, and closing", () => {
    const url = buildArtworkInquiryMailto(baseInput);
    const body = decodeURIComponent(url.split("body=")[1]);

    expect(body).toContain("Hello Juan Dela Cruz,");
    expect(body).toContain('I am interested in your artwork "Sunset over Manila".');
    expect(body).toContain("Is the original still available?");
    expect(body).toContain("Thank you.");
    expect(body).not.toContain("From:");
  });

  it("appends the sender email when available so the artist can reply", () => {
    const url = buildArtworkInquiryMailto({
      ...baseInput,
      userEmail: "buyer@example.com",
    });
    const body = decodeURIComponent(url.split("body=")[1]);
    expect(body).toContain("From: buyer@example.com");
  });

  it("encodes newlines and special characters safely", () => {
    const url = buildArtworkInquiryMailto({
      ...baseInput,
      artworkTitle: "Blue & Red / Study",
      message: "First line\nSecond line & more",
    });
    expect(url).not.toContain("\n");
    expect(url).toContain(encodeURIComponent("Blue & Red / Study"));
    expect(url).toContain(encodeURIComponent("First line\nSecond line & more"));
  });
});

describe("formatArtistDisplayName", () => {
  it("joins first and last name", () => {
    expect(
      formatArtistDisplayName({
        first_name: "Juan",
        last_name: "Dela Cruz",
        username: "juandc",
      }),
    ).toBe("Juan Dela Cruz");
  });

  it("falls back to the username when no names exist", () => {
    expect(
      formatArtistDisplayName({
        first_name: null,
        last_name: null,
        username: "juandc",
      }),
    ).toBe("juandc");
  });

  it("falls back to a placeholder when nothing is available", () => {
    expect(
      formatArtistDisplayName({
        first_name: null,
        last_name: null,
        username: null,
      }),
    ).toBe("Unknown artist");
  });
});
