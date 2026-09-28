import { describe, expect, it } from "vitest";
import { scrambledFrame } from "@/features/public/home/scramble-text";

const LABEL = "TRY UPLOADING ARTWORK";

function letters(value: string) {
  return Array.from(value)
    .filter((char) => char !== " ")
    .sort()
    .join("");
}

describe("scrambledFrame", () => {
  it("rearranges the label's own letters and keeps spaces", () => {
    const frame = scrambledFrame(LABEL, 0, () => 0);

    expect(frame).not.toBe(LABEL);
    expect(frame).toHaveLength(LABEL.length);
    expect(letters(frame)).toBe(letters(LABEL));
    expect(frame[3]).toBe(" ");
    expect(frame[13]).toBe(" ");
  });

  it("locks the revealed prefix and shuffles only the remaining letters", () => {
    const frame = scrambledFrame(LABEL, 4 / LABEL.length, () => 0);

    expect(frame.startsWith("TRY ")).toBe(true);
    expect(letters(frame.slice(4))).toBe(letters(LABEL.slice(4)));
  });

  it("returns the original label once the scramble finishes", () => {
    expect(scrambledFrame(LABEL, 1, () => 0)).toBe(LABEL);
    expect(scrambledFrame(LABEL, 1.4, () => 0)).toBe(LABEL);
  });
});
