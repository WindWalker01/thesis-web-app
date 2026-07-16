"use client";

import {
  ImageIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Archive,
  Flag,
  GitCompare,
  Upload,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/client-utils";
import type { ArtworkStats as ArtworkStatsType } from "../types";

interface ArtworkStatsProps {
  stats: ArtworkStatsType | undefined;
  isLoading: boolean;
}

const statCards = [
  { key: "total_registered", label: "Total Registered", icon: ImageIcon, color: "text-blue-600", bg: "bg-blue-100" },
  { key: "pending_blockchain", label: "Pending Blockchain", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
  { key: "blockchain_registered", label: "Blockchain Registered", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
  { key: "flagged_for_review", label: "Flagged For Review", icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-100" },
  { key: "public_posts", label: "Public Posts", icon: Globe, color: "text-sky-600", bg: "bg-sky-100" },
  { key: "archived_posts", label: "Archived Posts", icon: Archive, color: "text-gray-600", bg: "bg-gray-100" },
  { key: "reported_artworks", label: "Reported Artworks", icon: Flag, color: "text-red-600", bg: "bg-red-100" },
  { key: "similarity_matches", label: "Similarity Matches", icon: GitCompare, color: "text-purple-600", bg: "bg-purple-100" },
  { key: "todays_uploads", label: "Today's Uploads", icon: Upload, color: "text-indigo-600", bg: "bg-indigo-100" },
  { key: "highest_similarity_today", label: "Highest Similarity Today", icon: TrendingUp, color: "text-rose-600", bg: "bg-rose-100" },
];

export function ArtworkStats({ stats, isLoading }: ArtworkStatsProps) {
  const getValue = (key: string) => {
    if (!stats) return 0;
    const val = stats[key as keyof ArtworkStatsType];
    if (val === null) return "—";
    return val;
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {statCards.map((card) => {
        const Icon = card.icon;
        const value = getValue(card.key);

        return (
          <div
            key={card.key}
            className="rounded-xl border bg-card p-4 transition-colors hover:bg-accent/50"
          >
            <div className="flex items-center justify-between">
              <div className={cn("rounded-lg p-2", card.bg)}>
                <Icon className={cn("h-4 w-4", card.color)} />
              </div>
            </div>
            <div className="mt-3">
              {isLoading ? (
                <div className="h-7 w-12 animate-pulse rounded bg-muted" />
              ) : (
                <p className="text-2xl font-bold tracking-tight">{value}</p>
              )}
              <p className="mt-0.5 text-xs text-muted-foreground">{card.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}