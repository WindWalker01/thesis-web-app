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
