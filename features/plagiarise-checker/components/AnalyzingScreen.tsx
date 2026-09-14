"use client";

import { Badge } from "@/components/ui/badge";
import { useEffect, useMemo, useState } from "react";
import type { Mode } from "../types";

interface AnalyzingScreenProps {
  progress?: number;
  mode: Mode;
  /** When true, shows an animated indeterminate bar instead of a fixed progress value */
  indeterminate?: boolean;
}

const STEPS: Record<Mode, string[]> = {
  web: ["Fingerprinting", "DB lookup", "Web crawl", "Ranking results"],
  compare: ["Fingerprinting", "Transform hashes", "Block hashes", "Scoring"],
};

const TECHNICAL_MESSAGES: Record<Mode, string[]> = {
  web: [
    "Extracting perceptual hashes...",
    "Cross-referencing blockchain ledger...",
    "Crawling web sources for matches...",
    "Aggregating and ranking candidates...",
  ],
  compare: [
    "Extracting perceptual hashes...",
    "Computing transform-candidate hashes...",
    "Comparing block signatures...",
    "Scoring consensus similarity...",
  ],
};

export function AnalyzingScreen({
  progress = 0,
  mode,
  indeterminate = false,
}: AnalyzingScreenProps) {
  const steps = STEPS[mode];
  const messages = TECHNICAL_MESSAGES[mode];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % messages.length), 2200);
    return () => clearInterval(t);
  }, [messages.length]);

  const currentMessage = useMemo(() => messages[idx], [messages, idx]);

  return (
    <div className="bg-card border-border flex flex-col items-center gap-6 rounded-2xl border p-6 text-center sm:p-10 md:p-16">
      <div className="flex items-center gap-4">
        <div className="bg-primary shadow-primary/30 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl">
          <svg
            className="text-primary-foreground h-8 w-8 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              strokeOpacity="0.15"
            />
            <path
              d="M22 12a10 10 0 0 1-10 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="text-left">
          <h2 className="text-foreground text-xl font-bold">
            {mode === "web" ? "Searching Web & Database" : "Comparing Images"}
          </h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {currentMessage}
          </p>
        </div>
      </div>

      <div className="w-full max-w-md space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">pHash analysis</span>
          {!indeterminate && (
            <span className="text-primary font-mono">{progress}%</span>
          )}
        </div>

        <div className="bg-muted relative h-2 overflow-hidden rounded-full">
          {indeterminate ? (
            <div className="bg-primary shadow-primary/50 absolute inset-y-0 w-1/3 animate-[marquee_1.4s_linear_infinite] rounded-full shadow-sm" />
          ) : (
            <div
              className="bg-primary shadow-primary/50 h-full rounded-full shadow-sm transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {steps.map((step, i) => (
          <Badge
            key={step}
            variant={indeterminate || progress > i * 25 ? "default" : "outline"}
            className="text-[11px] transition-all duration-300"
          >
            {step}
          </Badge>
        ))}
      </div>
    </div>
  );
}
