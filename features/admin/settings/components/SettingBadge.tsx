"use client";

import { cn } from "@/lib/client-utils";
import type { SettingBadgeType } from "../types";

const badgeStyles: Record<SettingBadgeType, string> = {
  recommended: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  advanced: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  experimental: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const badgeLabels: Record<SettingBadgeType, string> = {
  recommended: "Recommended",
  advanced: "Advanced",
  experimental: "Experimental",
  critical: "Critical",
};

type SettingBadgeProps = {
  type: SettingBadgeType;
  className?: string;
};

export function SettingBadge({ type, className }: SettingBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        badgeStyles[type],
        className
      )}
    >
      {badgeLabels[type]}
    </span>
  );
}