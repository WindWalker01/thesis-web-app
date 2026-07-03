"use client";

import {
  Users,
  ShieldCheck,
  ImageIcon,
  AlertTriangle,
  CheckCircle2,
  Hash,
  ScanSearch,
  Heart,
} from "lucide-react";
import { StatsCard } from "./stats-card";
import type { AdminDashboardStats } from "../types";

type OverviewCardsProps = {
  stats: AdminDashboardStats;
};

export function OverviewCards({ stats }: OverviewCardsProps) {
  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      trend: { value: 0, isPositive: true, label: "All registered users" },
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      title: "Verified Artists",
      value: stats.verifiedArtists,
      icon: ShieldCheck,
      trend: { value: 0, isPositive: true, label: "Verified accounts" },
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
    {
      title: "Total Artworks",
      value: stats.totalArtworks,
      icon: ImageIcon,
      trend: { value: 0, isPositive: true, label: "All uploaded artworks" },
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
    },
    {
      title: "Pending Reports",
      value: stats.pendingReports,
      icon: AlertTriangle,
      trend: { value: 0, isPositive: false, label: "Awaiting review" },
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      warning: stats.pendingReports > 10,
    },
    {
      title: "Resolved Reports",
      value: stats.resolvedReports,
      icon: CheckCircle2,
      trend: { value: 0, isPositive: true, label: "Successfully resolved" },
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      title: "Blockchain Registrations",
      value: stats.blockchainRegistrations,
      icon: Hash,
      trend: { value: 0, isPositive: true, label: "On-chain records" },
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
    },
    {
      title: "Detected Similarities",
      value: stats.detectedSimilarities,
      icon: ScanSearch,
      trend: { value: 0, isPositive: false, label: "Potential matches" },
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },
    {
      title: "Community Upvotes",
      value: stats.totalUpvotes,
      icon: Heart,
      trend: { value: 0, isPositive: true, label: "Total upvotes given" },
      color: "text-pink-500",
      bg: "bg-pink-500/10",
      border: "border-pink-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <StatsCard key={card.title} {...card} index={i} />
      ))}
    </div>
  );
}