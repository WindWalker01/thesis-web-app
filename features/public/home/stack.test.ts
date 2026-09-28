import { describe, expect, it } from "vitest";
import {
  activeStackStep,
  railDotMotion,
  railJourney,
  railPhases,
  railRole,
  stackScrollProgress,
  stackEdgeMask,
  stackStepLabel,
  stackStripOffset,
  stackStripScale,
  stackFrameShare,
  stackRailLeft,
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

  it("runs one loop from the first fork through every line except the last screenshot", () => {
    expect(railRole(0, 4)).toBe("fork");
    expect(railRole(1, 4)).toBe("line");
    expect(railRole(2, 4)).toBe("line");
    expect(railRole(3, 4)).toBe("none");

    const opening = railJourney(0, 4);
    expect(opening).toMatchObject({ index: 0, role: "fork" });

    const later = railJourney(0.85, 4);
    expect(later?.role).toBe("line");
    expect(later?.index).toBeGreaterThan(0);

    const ending = railJourney(0.99, 4);
    expect(ending?.index).toBe(2);
  });

  it("spaces several travelers along one loop", () => {
    const phases = railPhases(0.1, 4);
    expect(phases).toHaveLength(4);
    phases.forEach((phase, index) => {
      expect(phase).toBeCloseTo((0.1 + index / 4) % 1);
    });
    expect(railPhases(0.9, 4)[1]).toBeCloseTo(0.15);
    const wrapped = railPhases(-0.2, 2);
    expect(wrapped[0]).toBeCloseTo(0.8);
    expect(wrapped[1]).toBeCloseTo(0.3);
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
    expect(start.mid.opacity).toBe(0);
    expect(early.mid.opacity).toBe(0);

    const fading = railDotMotion(0.25);
    expect(fading.merged).toBe(false);
    if (!fading.merged) {
      expect(fading.mid.opacity).toBeGreaterThan(0);
      expect(fading.mid.opacity).toBeLessThan(1);
      expect(fading.mid.x).toBeGreaterThan(start.mid.x);
    }

    const visible = railDotMotion(0.45);
    expect(visible.merged).toBe(false);
    if (!visible.merged) expect(visible.mid.opacity).toBe(1);

    const joined = railDotMotion(0.68);
    expect(joined.merged).toBe(true);
    if (!joined.merged) return;
    expect(joined.point.x).toBeCloseTo(30);
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
    const shift = (stackFrameShare(0, 4) / stackStripScale(4)) * 100;
    expect(stackStripOffset(1, 4)).toBe(`translate3d(-${shift}%, 0, 0)`);
    expect(stackFrameShare(0, 4)).toBeGreaterThan(stackFrameShare(3, 4));
    expect(stackRailLeft(1, 4)).toBe(stackRailLeft(2, 4));
    expect(stackEdgeMask(0)).toBe(
      "linear-gradient(to right, black 0%, black 92%, transparent)",
    );
    expect(stackEdgeMask(0.5)).toBe(
      "linear-gradient(to right, transparent, black 4%, black 92%, transparent)",
    );
    expect(stackEdgeMask(1)).toBe(
      "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
    );
  });
});
