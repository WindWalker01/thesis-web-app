"use client";

import { cn } from "@/lib/client-utils";
import { RISK_LEVEL_CONFIG, getRiskLevel, type RiskLevel } from "../types";

interface RiskBadgeProps {
  similarity: number | null;
  className?: string;
}

export function RiskBadge({ similarity, className }: RiskBadgeProps) {
  const level = getRiskLevel(similarity);
  const config = RISK_LEVEL_CONFIG[level];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        config.bg,
        config.color,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
      {similarity !== null && (
        <span className="opacity-75">({similarity.toFixed(1)}%)</span>
      )}
    </span>
  );
}

export function RiskBadgeSimple({ level, className }: { level: RiskLevel; className?: string }) {
  const config = RISK_LEVEL_CONFIG[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        config.bg,
        config.color,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}