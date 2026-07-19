"use client";

import { useMemo } from "react";
import type { Report } from "@/features/reports/types";
import { cn } from "@/lib/client-utils";

// ── Icons (inline to avoid too many lucide imports) ──
function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

// ── Card definitions ──
type StatCardDef = {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  ringColor: string;
  filterFn: (r: Report) => boolean;
};

function createCards(): StatCardDef[] {
  return [
    {
      key: "total",
      label: "Total Reports",
      icon: <FileTextIcon className="h-5 w-5" />,
      color: "text-slate-600 dark:text-slate-300",
      bgColor: "bg-slate-100 dark:bg-slate-800/60",
      ringColor: "ring-slate-400/30 dark:ring-slate-500/30",
      filterFn: () => true,
    },
    {
      key: "pending",
      label: "Open",
      icon: <ClockIcon className="h-5 w-5" />,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      ringColor: "ring-blue-400/30 dark:ring-blue-500/30",
      filterFn: (r) => r.status === "pending_review",
    },
    {
      key: "under_review",
      label: "Under Review",
      icon: <SearchIcon className="h-5 w-5" />,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      ringColor: "ring-amber-400/30 dark:ring-amber-500/30",
      filterFn: (r) => r.status === "under_review",
    },
    {
      key: "awaiting",
      label: "Awaiting Response",
      icon: <MessageIcon className="h-5 w-5" />,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      ringColor: "ring-orange-400/30 dark:ring-orange-500/30",
      filterFn: () => false, // Placeholder - shows 0 by default
    },
    {
      key: "resolved",
      label: "Resolved",
      icon: <CheckCircleIcon className="h-5 w-5" />,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
      ringColor: "ring-emerald-400/30 dark:ring-emerald-500/30",
      filterFn: (r) => r.status === "resolved",
    },
    {
      key: "closed",
      label: "Closed",
      icon: <XCircleIcon className="h-5 w-5" />,
      color: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-100 dark:bg-gray-800/60",
      ringColor: "ring-gray-400/30 dark:ring-gray-500/30",
      filterFn: () => false, // Placeholder - shows 0 by default
    },
  ];
}

// ── Props ──
type DashboardStatsCardsProps = {
  reports: Report[];
};

export function DashboardStatsCards({ reports }: DashboardStatsCardsProps) {
  const cards = useMemo(() => {
    return createCards().map((card) => ({
      ...card,
      count: card.key === "total" ? reports.length : reports.filter(card.filterFn).length,
    }));
  }, [reports]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <div
          key={card.key}
          className={cn(
            "group relative overflow-hidden rounded-xl border bg-card p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-md",
            "ring-1 ring-inset",
            card.ringColor
          )}
        >
          {/* Hover accent bar */}
          <div
            className={cn(
              "absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100",
              card.key === "total" ? "bg-slate-400 dark:bg-slate-500" :
              card.key === "pending" ? "bg-blue-500" :
              card.key === "under_review" ? "bg-amber-500" :
              card.key === "awaiting" ? "bg-orange-500" :
              card.key === "resolved" ? "bg-emerald-500" :
              "bg-gray-400 dark:bg-gray-500"
            )}
          />

          <div className="flex items-center justify-between">
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", card.bgColor, card.color)}>
              {card.icon}
            </div>
          </div>

          <div className="mt-3">
            <p className="text-2xl font-bold tracking-tight">{card.count}</p>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}