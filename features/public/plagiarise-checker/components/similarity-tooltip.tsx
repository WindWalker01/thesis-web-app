"use client";

import { Info } from "lucide-react";

/**
 * Inline "What does similarity mean?" tooltip. Uses a pure-CSS hover/focus
 * disclosure (no extra dependency) and is keyboard-focusable. Place it in a
 * non-`overflow-hidden` container so the popover is never clipped.
 */
export function SimilarityTooltip() {
  return (
    <span className="group relative inline-flex items-center">
      <button
        type="button"
        aria-label="What does similarity mean?"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs underline decoration-dotted underline-offset-4 transition-colors"
      >
        <Info size={12} className="shrink-0" />
        What does similarity mean?
      </button>
      <span
        role="tooltip"
        className="bg-foreground text-background pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-72 max-w-[80vw] -translate-x-1/2 rounded-lg px-3 py-2 text-left text-[11px] leading-relaxed opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        The similarity percentage represents visual similarity detected through
        perceptual hash comparison. Similarity results are indicators for
        further review and do not constitute a legal determination of copyright
        infringement.
      </span>
    </span>
  );
}
