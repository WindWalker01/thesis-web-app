"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  SCRAMBLE_DURATION_MS,
  SCRAMBLE_FRAME_MS,
  scrambledFrame,
} from "@/features/public/home/scramble-text";

/** Same bottom-right chamfer as the perceptual hashing cards. */
export const BUTTON_CORNER_CLIP =
  "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)";

function useScrambledLabel(text: string, active: boolean) {
  const [scrambled, setScrambled] = useState(text);

  useEffect(() => {
    if (!active) return;

    let frame = 0;
    let lastTick = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      if (
        elapsed < SCRAMBLE_DURATION_MS &&
        now - lastTick < SCRAMBLE_FRAME_MS
      ) {
        frame = requestAnimationFrame(tick);
        return;
      }

      lastTick = now;
      const progress = elapsed / SCRAMBLE_DURATION_MS;
      setScrambled(scrambledFrame(text, progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, text]);

  return active ? scrambled : text;
}

export function useScrambleHover(text: string) {
  const reduceMotion = useReducedMotion() === true;
  const [hovering, setHovering] = useState(false);
  const display = useScrambledLabel(text, hovering && !reduceMotion);

  return {
    display,
    scrambleHover: {
      onMouseEnter: () => setHovering(true),
      onMouseLeave: () => setHovering(false),
      onFocus: () => setHovering(true),
      onBlur: () => setHovering(false),
    },
  };
}

export function ScrambledText({
  text,
  display,
}: {
  text: string;
  display: string;
}) {
  return (
    <span className="inline-flex" aria-hidden="true">
      {Array.from(text).map((char, index) => {
        const glyph = char === " " ? "\u00A0" : char;
        const shown = char === " " ? "\u00A0" : (display[index] ?? char);
        return (
          <span key={`${char}-${index}`} className="relative inline-block">
            <span className="invisible">{glyph}</span>
            <span className="absolute inset-0 flex items-center justify-center overflow-hidden">
              {shown}
            </span>
          </span>
        );
      })}
    </span>
  );
}
