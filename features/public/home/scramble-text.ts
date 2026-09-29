export const SCRAMBLE_DURATION_MS = 320;

export const SCRAMBLE_FRAME_MS = 20;

/**
 * One frame of a left-to-right scramble.
 * Unrevealed letters are a shuffle of the label's own remaining letters.
 * Spaces stay in place.
 */
export function scrambledFrame(
  text: string,
  progress: number,
  random: () => number = Math.random,
): string {
  if (progress >= 1) return text;

  const chars = Array.from(text);
  const revealCount = Math.floor(Math.max(0, progress) * chars.length);
  const pool = chars.filter((char, index) => char !== " " && index >= revealCount);

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.min(i, Math.floor(random() * (i + 1)));
    const current = pool[i];
    pool[i] = pool[j] ?? current;
    pool[j] = current;
  }

  let poolIndex = 0;
  return chars
    .map((char, index) => {
      if (char === " ") return " ";
      if (index < revealCount) return char;
      const next = pool[poolIndex];
      poolIndex += 1;
      return next ?? char;
    })
    .join("");
}
