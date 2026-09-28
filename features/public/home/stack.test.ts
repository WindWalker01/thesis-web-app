import { describe, expect, it } from "vitest";
import {
  activeStackStep,
  stackScrollProgress,
  stackStepLabel,
  stackStripOffset,
  stackTrackHeight,
} from "@/features/public/home/stack";

describe("product stack scroll", () => {
  it("maps scroll distance across the steps", () => {
    expect(stackScrollProgress(0, 300, 4)).toBe(0);
    expect(stackScrollProgress(150, 300, 4)).toBe(1.5);
    expect(stackScrollProgress(300, 300, 4)).toBe(3);
    expect(stackScrollProgress(-20, 300, 4)).toBe(0);
    expect(stackScrollProgress(400, 300, 4)).toBe(3);
    expect(stackScrollProgress(10, 0, 4)).toBe(0);
  });

  it("rounds to the nearest visible step", () => {
    expect(activeStackStep(0.4, 4)).toBe(0);
    expect(activeStackStep(0.5, 4)).toBe(1);
    expect(activeStackStep(2.6, 4)).toBe(3);
    expect(activeStackStep(9, 4)).toBe(3);
  });

  it("formats the step counter and track size", () => {
    expect(stackStepLabel(0, 4)).toBe("01/04");
    expect(stackStepLabel(3, 4)).toBe("04/04");
    expect(stackTrackHeight(4, 85)).toBe("calc(100svh + 255svh)");
    expect(stackStripOffset(1, 4)).toBe("translate3d(-25%, 0, 0)");
  });
});
