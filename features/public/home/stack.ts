export const STACK_STEP_VH = 85;

export function stackScrollProgress(
  scrolled: number,
  scrollable: number,
  stepCount: number,
): number {
  if (stepCount <= 1 || scrollable <= 0) return 0;
  const ratio = Math.min(1, Math.max(0, scrolled / scrollable));
  return ratio * (stepCount - 1);
}

export function activeStackStep(progress: number, stepCount: number): number {
  if (stepCount <= 0) return 0;
  const index = Math.round(progress);
  return Math.min(stepCount - 1, Math.max(0, index));
}

export function stackStepLabel(index: number, stepCount: number): string {
  const current = String(index + 1).padStart(2, "0");
  const total = String(stepCount).padStart(2, "0");
  return `${current}/${total}`;
}

export function stackTrackHeight(
  stepCount: number,
  stepViewportUnits = STACK_STEP_VH,
): string {
  const extra = Math.max(stepCount - 1, 0) * stepViewportUnits;
  return `calc(100svh + ${extra}svh)`;
}

export function stackStripOffset(progress: number, stepCount: number): string {
  if (stepCount <= 0) return "translate3d(0, 0, 0)";
  const shift = (progress / stepCount) * 100;
  return `translate3d(-${shift}%, 0, 0)`;
}

export type RailPoint = { x: number; y: number };

/** Share of the step used to travel the three curves before they merge. */
const CURVE_SPAN = 0.68;
/** How far behind the outer dots the middle dot stays, as a fraction of the curve. */
const MID_LAG = 0.22;

const MEET: RailPoint = { x: 58, y: 50 };
const LINE_END: RailPoint = { x: 100, y: 50 };

const TOP: readonly [RailPoint, RailPoint, RailPoint, RailPoint] = [
  { x: 8, y: 22 },
  { x: 30, y: 22 },
  { x: 46, y: 50 },
  MEET,
];
const MID: readonly [RailPoint, RailPoint, RailPoint, RailPoint] = [
  { x: 8, y: 50 },
  { x: 26, y: 50 },
  { x: 44, y: 50 },
  MEET,
];
const BOT: readonly [RailPoint, RailPoint, RailPoint, RailPoint] = [
  { x: 8, y: 78 },
  { x: 30, y: 78 },
  { x: 46, y: 50 },
  MEET,
];

export const RAIL_CURVES = {
  top: "M 8 22 C 30 22, 46 50, 58 50",
  mid: "M 8 50 C 26 50, 44 50, 58 50",
  bot: "M 8 78 C 30 78, 46 50, 58 50",
  line: "M 58 50 L 100 50",
} as const;

function cubic(t: number, p0: number, p1: number, p2: number, p3: number) {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

function curvePoint(
  t: number,
  curve: readonly [RailPoint, RailPoint, RailPoint, RailPoint],
): RailPoint {
  const amount = Math.min(1, Math.max(0, t));
  return {
    x: cubic(amount, curve[0].x, curve[1].x, curve[2].x, curve[3].x),
    y: cubic(amount, curve[0].y, curve[1].y, curve[2].y, curve[3].y),
  };
}

export type RailDots =
  | { merged: false; top: RailPoint; mid: RailPoint; bot: RailPoint }
  | { merged: true; point: RailPoint };

export type RailRole = "fork" | "line" | "none";

export function railRole(index: number, count: number): RailRole {
  if (count <= 1 || index >= count - 1) return "none";
  if (index <= 0) return "fork";
  return "line";
}

export type RailJourney = {
  index: number;
  role: Exclude<RailRole, "none">;
  local: number;
};

const FORK_WEIGHT = 1.35;

export function railPhases(travel: number, count: number): number[] {
  const total = Math.max(1, Math.floor(count));
  const start = ((travel % 1) + 1) % 1;
  return Array.from({ length: total }, (_, index) => (start + index / total) % 1);
}

export function railJourney(travel: number, stepCount: number): RailJourney | null {
  const connectors = Math.max(stepCount - 1, 0);
  if (connectors === 0) return null;

  const t = ((travel % 1) + 1) % 1;
  const total = FORK_WEIGHT + (connectors - 1);
  let cursor = 0;

  for (let index = 0; index < connectors; index += 1) {
    const weight = index === 0 ? FORK_WEIGHT : 1;
    const span = weight / total;
    const end = index === connectors - 1 ? 1 : cursor + span;
    if (t < end || index === connectors - 1) {
      const local = span === 0 ? 0 : (t - cursor) / span;
      return {
        index,
        role: index === 0 ? "fork" : "line",
        local: Math.min(1, Math.max(0, local)),
      };
    }
    cursor += span;
  }

  return null;
}

export function railDotMotion(travel: number): RailDots {
  const t = Math.min(1, Math.max(0, travel));
  if (t < CURVE_SPAN) {
    const along = t / CURVE_SPAN;
    const midAlong = along <= MID_LAG ? 0 : (along - MID_LAG) / (1 - MID_LAG);
    return {
      merged: false,
      top: curvePoint(along, TOP),
      mid: curvePoint(midAlong, MID),
      bot: curvePoint(along, BOT),
    };
  }

  const along = (t - CURVE_SPAN) / (1 - CURVE_SPAN);
  return {
    merged: true,
    point: {
      x: MEET.x + (LINE_END.x - MEET.x) * along,
      y: MEET.y,
    },
  };
}
