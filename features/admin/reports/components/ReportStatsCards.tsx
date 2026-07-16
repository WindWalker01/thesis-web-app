"use client";

import { motion } from "framer-motion";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Timer,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/client-utils";
import type { ReportStatistics } from "@/features/reports/types";

interface ReportStatsCardsProps {
  stats: ReportStatistics | undefined;
  isLoading: boolean;
}

const STAT_CARDS = [
  {
    key: "open" as const,
    title: "Pending Reports",
    icon: Clock,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    border: "border-yellow-200/50",
  },
  {
    key: "under_review" as const,
    title: "Under Investigation",
    icon: ShieldAlert,
    color: "text-blue-600",
    bg: "bg-blue-100",
    border: "border-blue-200/50",
  },
  {
    key: "resolved" as const,
    title: "Resolved",
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-100",
    border: "border-green-200/50",
  },
  {
    key: "rejected" as const,
    title: "Rejected",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-100",
    border: "border-red-200/50",
  },
  {
    key: "waiting_for_reporter" as const,
    title: "Escalated",
    icon: AlertTriangle,
    color: "text-purple-600",
    bg: "bg-purple-100",
    border: "border-purple-200/50",
  },
  {
    key: "avg_time" as const,
    title: "Avg Resolution Time",
    icon: Timer,
    color: "text-cyan-600",
    bg: "bg-cyan-100",
    border: "border-cyan-200/50",
    isAvgTime: true,
  },
  {
    key: "today" as const,
    title: "Reports Today",
    icon: FileText,
    color: "text-orange-600",
    bg: "bg-orange-100",
    border: "border-orange-200/50",
    isToday: true,
  },
];

export function ReportStatsCards({ stats, isLoading }: ReportStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {STAT_CARDS.map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border bg-card p-5 space-y-3 animate-pulse"
          >
            <div className="h-10 w-10 rounded-xl bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="h-8 w-16 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const getValue = (card: (typeof STAT_CARDS)[number]) => {
    if (card.isAvgTime) {
      const hours = stats.average_resolution_time_hours;
      if (hours === null) return "—";
      if (hours < 1) return `${Math.round(hours * 60)}m`;
      if (hours < 24) return `${Math.round(hours)}h`;
      return `${(hours / 24).toFixed(1)}d`;
    }
    if (card.isToday) {
      return stats.reports_this_month.toLocaleString();
    }
    // Use a safe lookup: only access keys that exist on ReportStatistics
    const statKey = card.key as keyof typeof stats;
    return typeof stats[statKey] === "number"
      ? (stats[statKey] as number).toLocaleString()
      : "—";
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {STAT_CARDS.map((card, index) => {
        const Icon = card.icon;
        const value = getValue(card);

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.32 }}
            className={cn(
              "bg-card border rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
              card.border
            )}
          >
            <div
              className={cn(
                "h-10 w-10 rounded-xl mb-4 flex items-center justify-center",
                card.bg
              )}
            >
              <Icon className={cn("h-5 w-5", card.color)} />
            </div>
            <p className="text-muted-foreground text-sm font-medium">
              {card.title}
            </p>
            <p className="mt-1 text-foreground text-3xl font-black">
              {value}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}