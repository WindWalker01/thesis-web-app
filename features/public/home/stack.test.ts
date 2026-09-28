import { describe, expect, it } from "vitest";
import {
  activeStackStep,
  railDotMotion,
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

  it("keeps the outer dots together and lets the middle dot catch up at the join", () => {
    const start = railDotMotion(0);
    expect(start.merged).toBe(false);
    if (start.merged) return;
    expect(start.top.y).toBeLessThan(start.mid.y);
    expect(start.bot.y).toBeGreaterThan(start.mid.y);
    expect(start.top.x).toBeCloseTo(start.bot.x);

    const early = railDotMotion(0.08);
    expect(early.merged).toBe(false);
    if (early.merged) return;
    expect(early.top.x).toBeGreaterThan(start.top.x);
    expect(early.bot.x).toBeCloseTo(early.top.x);
    expect(early.mid.x).toBeCloseTo(start.mid.x);

    const joined = railDotMotion(0.68);
    expect(joined.merged).toBe(true);
    if (!joined.merged) return;
    expect(joined.point.x).toBeGreaterThan(50);
    expect(joined.point.y).toBeCloseTo(50);

    const done = railDotMotion(1);
    expect(done.merged).toBe(true);
    if (!done.merged) return;
    expect(done.point.x).toBeCloseTo(100);
  });

  it("formats the step counter and track size", () => {
    expect(stackStepLabel(0, 4)).toBe("01/04");
    expect(stackStepLabel(3, 4)).toBe("04/04");
    expect(stackTrackHeight(4, 85)).toBe("calc(100svh + 255svh)");
    expect(stackStripOffset(1, 4)).toBe("translate3d(-25%, 0, 0)");
  });
});
