"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/client-utils";
import type { LucideIcon } from "lucide-react";

type StatsCardProps = {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  color: string;
  bg: string;
  border: string;
  index: number;
  warning?: boolean;
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
  bg,
  border,
  index,
  warning,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.32 }}
      className={cn(
        "bg-card border rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
        warning ? "border-orange-500/50 ring-1 ring-orange-500/20" : border
      )}
    >
      <div
        className={cn(
          "h-10 w-10 rounded-xl mb-4 flex items-center justify-center",
          bg
        )}
      >
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      <p className="text-muted-foreground text-sm font-medium truncate">{title}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-foreground text-3xl font-black break-words">
          {value.toLocaleString()}
        </p>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold shrink-0",
              trend.isPositive ? "text-green-500" : "text-red-500"
            )}
          >
            {trend.isPositive ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
      {trend && (
        <p className="text-muted-foreground mt-1 text-xs truncate">{trend.label}</p>
      )}
    </motion.div>
  );
}