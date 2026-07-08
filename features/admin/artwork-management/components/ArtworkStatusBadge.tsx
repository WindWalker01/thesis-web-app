"use client";

import { cn } from "@/lib/client-utils";
import { ARTWORK_STATUS_CONFIG, BLOCKCHAIN_STATUS_CONFIG, VISIBILITY_CONFIG } from "../types";

interface StatusBadgeProps {
  status: string;
  type?: "artwork" | "blockchain" | "visibility";
  className?: string;
}

export function ArtworkStatusBadge({ status, type = "artwork", className }: StatusBadgeProps) {
  const config =
    type === "blockchain"
      ? BLOCKCHAIN_STATUS_CONFIG[status]
      : type === "visibility"
        ? VISIBILITY_CONFIG[status]
        : ARTWORK_STATUS_CONFIG[status];

  if (!config) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          "bg-gray-100 text-gray-600",
          className
        )}
      >
        {status}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.bg,
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export function NeedsReviewBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        "bg-orange-100 text-orange-600",
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
      Manual Review
    </span>
  );
}