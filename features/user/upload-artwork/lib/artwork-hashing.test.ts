import { describe, expect, it } from "vitest";

import {
  normalizePerceptualHashToBytes32,
  sha256Hex,
  stableStringify,
} from "@/features/(user)/upload-artwork/lib/artwork-hashing";

describe("sha256Hex", () => {
  it("hashes the empty buffer to the known SHA-256 vector", () => {
    expect(sha256Hex(Buffer.from(""))).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });

  it("hashes 'abc' to the known SHA-256 vector", () => {
    expect(sha256Hex(Buffer.from("abc"))).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });
});

describe("normalizePerceptualHashToBytes32", () => {
  it("strips a 0x prefix and left-pads to 64 hex chars", () => {
    const result = normalizePerceptualHashToBytes32("0xabcdef");

    expect(result).toBe(`0x${"abcdef".padStart(64, "0")}`);
    expect(result).toHaveLength(66); // "0x" + 64
  });

  it("lowercases and pads a bare hex string", () => {
    expect(normalizePerceptualHashToBytes32("ABCD")).toBe(
      `0x${"abcd".padStart(64, "0")}`,
    );
  });

  it("passes through a full 64-char hex value unchanged (aside from 0x)", () => {
    const full = "f".repeat(64);
    expect(normalizePerceptualHashToBytes32(full)).toBe(`0x${full}`);
  });

  it("throws on non-hexadecimal input", () => {
    expect(() => normalizePerceptualHashToBytes32("xyz")).toThrow(
      /hexadecimal/i,
    );
  });

  it("throws when the value is too long for bytes32", () => {
    expect(() => normalizePerceptualHashToBytes32("a".repeat(65))).toThrow(
      /too long/i,
    );
  });
});

describe("stableStringify", () => {
  it("produces identical output regardless of key insertion order", () => {
    const a = stableStringify({ b: 1, a: 2, c: 3 });
    const b = stableStringify({ c: 3, a: 2, b: 1 });

    expect(a).toBe(b);
    expect(a).toBe('{"a":2,"b":1,"c":3}');
  });

  it("sorts nested object keys deterministically", () => {
    const value = { outer: { z: 1, a: { y: 2, x: 3 } } };

    expect(stableStringify(value)).toBe('{"outer":{"a":{"x":3,"y":2},"z":1}}');
  });

  it("preserves array order while stabilizing element objects", () => {
    const value = [{ b: 1, a: 2 }, 5, "s"];

    expect(stableStringify(value)).toBe('[{"a":2,"b":1},5,"s"]');
  });

  it("handles primitives and null", () => {
    expect(stableStringify(null)).toBe("null");
    expect(stableStringify(42)).toBe("42");
    expect(stableStringify("hi")).toBe('"hi"');
    expect(stableStringify(true)).toBe("true");
  });
});
