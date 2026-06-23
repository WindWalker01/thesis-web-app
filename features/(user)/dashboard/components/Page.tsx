"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImageIcon,
  ShieldCheck,
  AlertTriangle,
  Upload,
  Clock,
  ArrowUpRight,
  ChevronRight,
  Hash,
  ArrowUp,
  TrendingUp,
  TrendingDown,
  Flame,
  BarChart2,
  Heart,
  Eye,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useDashboard } from "../hooks/useDashboard";
import type { DashboardTimeRange } from "../types";
import DashboardPageSkeleton from "./PageSkeleton";

type TimeRange = DashboardTimeRange;

const TIME_RANGE_OPTIONS: { key: TimeRange; label: string }[] = [
  { key: "24h", label: "24h" },
  { key: "7d", label: "7D" },
  { key: "1m", label: "1M" },
  { key: "1y", label: "1Y" },
  { key: "max", label: "Max" },
];

function HeroStatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <p className="text-sm tracking-wide text-slate-400 uppercase">{label}</p>
      <p className="mt-1 text-base font-semibold text-white">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [activeRange, setActiveRange] = useState<TimeRange>("1y");
  const { dashboard, isLoading, error } = useDashboard();

  const rangeLabel: Record<TimeRange, string> = {
    "24h": "today",
    "7d": "this week",
    "1m": "this month",
    "1y": "this year",
    max: "all time",
  };

  const chartData = dashboard?.chartData[activeRange] ?? [];
  const chartMax = Math.max(...chartData.map((d) => d.votes), 1);
  const chartTotal = chartData.reduce((sum, d) => sum + d.votes, 0);
  const chartPeak =
    chartData.length > 0
      ? chartData.reduce((a, b) => (a.votes > b.votes ? a : b))
      : { label: "-", votes: 0 };

  const statCards = [
    {
      label: "Your Artworks",
      value: dashboard?.stats.totalArtworks ?? 0,
      hint: "Total pieces uploaded",
      icon: ImageIcon,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Verified",
      value: dashboard?.stats.verified ?? 0,
      hint: "Blockchain confirmed",
      icon: ShieldCheck,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
    {
      label: "Total Upvotes",
      value: dashboard?.stats.totalUpvotes ?? 0,
      hint: "Across all gallery posts",
      icon: ArrowUp,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
    },
    {
      label: "Open Issues",
      value: dashboard?.stats.openIssues ?? 0,
      hint: "Flagged or removed",
      icon: AlertTriangle,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
  ];

  const activityToneMap = {
    upvote: { icon: ArrowUp, color: "text-orange-400", bg: "bg-orange-500/10" },
    verified: {
      icon: ShieldCheck,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    issue: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
    upload: { icon: Upload, color: "text-blue-400", bg: "bg-blue-500/10" },
    default: { icon: Clock, color: "text-purple-400", bg: "bg-purple-500/10" },
  };

  if (isLoading) {
    return <DashboardPageSkeleton />;
  }

  if (error || !dashboard) {
    return (
      <main className="bg-background font-display text-foreground min-h-screen overflow-x-hidden">
        <section className="container mx-auto px-4 py-20 md:px-6">
          <p className="text-base text-red-400">
            {error ?? "Failed to load dashboard."}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-background font-display text-foreground min-h-screen overflow-x-hidden">
      {/* ── Hero Header ── */}
      <section className="border-b bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-20 text-white">
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div className="space-y-4">
              <Badge
                variant="secondary"
                className="w-fit gap-2 bg-white/10 text-white hover:bg-white/10"
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                Artist Dashboard
              </Badge>
              <div className="space-y-3">
                <h1 className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl md:text-5xl">
                  Welcome back
                </h1>
                <p className="max-w-xl text-base text-slate-300 sm:text-base">
                  Track your uploads, monitor blockchain protection, and see how
                  the community is engaging with your work — all in one place.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link href="/upload-artwork">
                  <button className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-base font-bold text-white shadow-[0_0_20px_rgba(59,130,246,0.35)] transition hover:bg-blue-600">
                    <Upload className="h-3.5 w-3.5" /> Upload Art
                  </button>
                </Link>
                <Link href="/profile">
                  <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-base font-semibold text-white/80 transition hover:bg-white/10">
                    <Eye className="h-3.5 w-3.5" /> View Gallery
                  </button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <HeroStatCard
                label="Artworks"
                value={dashboard.heroStats.artworks}
              />
              <HeroStatCard
                label="Verified"
                value={dashboard.heroStats.verified}
              />
              <HeroStatCard
                label="Upvotes"
                value={dashboard.heroStats.upvotes}
              />
              <HeroStatCard
                label="pHash Check"
                value={dashboard.heroStats.phashCheck}
              />
              <HeroStatCard
                label="Crypto Hash"
                value={dashboard.heroStats.cryptoHash}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="container mx-auto px-4 py-8 md:px-6 md:py-10">
        <div className="space-y-6">
          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.32 }}
                  className={`bg-card border ${card.border} rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5`}
                >
                  <div
                    className={`h-9 w-9 rounded-xl ${card.bg} mb-4 flex items-center justify-center`}
                  >
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                  <p className="text-foreground text-2xl font-black">
                    {card.value}
                  </p>
                  <p className="text-foreground mt-0.5 text-sm font-bold">
                    {card.label}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm leading-snug">
                    {card.hint}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* ── Chart Row ── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* ── Upvotes Chart — 3 cols ── */}
            {/*
              DATA SOURCE: CHART_DATA_MOCK[activeRange]
              To use real data: replace each key in CHART_DATA_MOCK with your API result.
              The chart auto-scales — no other JSX changes needed.
            */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.32 }}
              className="bg-card border-border overflow-hidden rounded-2xl border lg:col-span-3"
            >
              {/* Card header */}
              <div className="border-border border-b px-5 pt-5 pb-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  {/* Title + total */}
                  <div>
                    <div className="mb-0.5 flex items-center gap-2">
                      <BarChart2 className="h-4 w-4 text-orange-400" />
                      <span className="text-base font-black tracking-widest uppercase">
                        Upvotes
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Total upvotes your posts received{" "}
                      {rangeLabel[activeRange]}
                    </p>
                  </div>

                  {/* ── Time-range filter tabs ── */}
                  <div className="bg-muted/60 border-border flex items-center gap-1 rounded-xl border p-1">
                    {TIME_RANGE_OPTIONS.map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setActiveRange(key)}
                        className={`relative rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all duration-200 ${
                          activeRange === key
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {/* Sliding pill background */}
                        {activeRange === key && (
                          <motion.span
                            layoutId="chart-range-pill"
                            className="bg-card border-border absolute inset-0 z-0 rounded-lg border shadow-sm"
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 30,
                            }}
                          />
                        )}
                        <span className="relative z-10">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Running total for selected range */}
                <div className="mt-3 flex items-baseline gap-2">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={activeRange + "-total"}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="text-foreground text-2xl font-black"
                    >
                      {chartTotal.toLocaleString()}
                    </motion.p>
                  </AnimatePresence>
                  <span className="text-muted-foreground text-sm">
                    upvotes {rangeLabel[activeRange]}
                  </span>
                </div>
              </div>

              {/* Chart body */}
              <div className="px-5 pt-5 pb-4">
                {/* Y-axis hints */}
                <div className="mb-1 flex items-center justify-between px-0.5">
                  <span className="text-muted-foreground text-[9px]">
                    {chartMax.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground text-[9px]">
                    {Math.round(chartMax / 2).toLocaleString()}
                  </span>
                  <span className="text-muted-foreground text-[9px]">0</span>
                </div>

                {/* Bars */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeRange}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="border-border flex h-36 items-end gap-1 border-b"
                  >
                    {chartData.map((d, i) => {
                      const isPeak = d.label === chartPeak.label;
                      const heightPct = Math.max((d.votes / chartMax) * 100, 2);
                      return (
                        <div
                          key={d.label}
                          className="group relative flex flex-1 flex-col items-center justify-end gap-0"
                          style={{ height: "100%" }}
                        >
                          {/* Tooltip */}
                          <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                            <div className="bg-foreground text-background rounded-lg px-2 py-1 text-[9px] font-bold whitespace-nowrap shadow-lg">
                              {d.votes.toLocaleString()} upvotes
                            </div>
                            {/* Arrow */}
                            <div className="bg-foreground mx-auto -mt-1 h-2 w-2 rotate-45" />
                          </div>

                          {/* Bar */}
                          <motion.div
                            className={`w-full cursor-default rounded-t-md transition-colors ${
                              isPeak
                                ? "bg-orange-500 hover:bg-orange-400"
                                : "bg-orange-500/35 hover:bg-orange-500/60"
                            }`}
                            style={{ minHeight: 4 }}
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPct}%` }}
                            transition={{
                              delay: i * 0.04,
                              duration: 0.45,
                              ease: "easeOut",
                            }}
                          />
                        </div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>

                {/* X-axis labels */}
                <div className="flex gap-1 pt-2">
                  {chartData.map((d) => (
                    <div key={d.label} className="flex-1 text-center">
                      <span
                        className={`text-[9px] leading-none font-semibold md:text-sm ${
                          d.label === chartPeak.label
                            ? "text-orange-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {d.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Peak annotation */}
                <AnimatePresence mode="wait">
                  <motion.p
                    key={activeRange + "-peak"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-muted-foreground mt-3 text-sm"
                  >
                    🔥 Peak:{" "}
                    <span className="text-foreground font-semibold">
                      {chartPeak.label} — {chartPeak.votes.toLocaleString()}{" "}
                      upvotes
                    </span>
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* ── Engagement Snapshot — 2 cols ── */}
            {/* DATA SOURCE: ENGAGEMENT_MOCK — replace with real aggregated stats */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34, duration: 0.32 }}
              className="bg-card border-border overflow-hidden rounded-2xl border lg:col-span-2"
            >
              <div className="border-border flex items-center gap-2 border-b px-5 py-4">
                <Flame className="h-4 w-4 text-red-400" />
                <span className="text-base font-black tracking-widest uppercase">
                  Engagement
                </span>
              </div>
              <div className="space-y-4 px-5 py-4">
                {[
                  {
                    label: "Total Upvotes",
                    value: dashboard.engagement.totalUpvotes,
                    icon: ArrowUp,
                    color: "text-orange-400",
                    bg: "bg-orange-500/10",
                  },
                  {
                    label: "Total Views",
                    value: dashboard.engagement.totalViews,
                    icon: Eye,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                  },
                  {
                    label: "Avg. Upvotes / Post",
                    value: dashboard.engagement.avgUpvotesPerPost,
                    icon: Heart,
                    color: "text-pink-400",
                    bg: "bg-pink-500/10",
                  },
                  {
                    label: "Most Upvoted Post",
                    value: dashboard.engagement.mostUpvotedTitle,
                    icon: TrendingUp,
                    color: "text-green-400",
                    bg: "bg-green-500/10",
                    small: true,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-lg ${item.bg} flex shrink-0 items-center justify-center`}
                      >
                        <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-muted-foreground text-sm">
                          {item.label}
                        </p>
                        <p
                          className={`truncate font-black ${"small" in item && item.small ? "text-sm" : "text-base"} text-foreground`}
                        >
                          {item.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* ── Top Posts + Activity ── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* ── Top Posts — 3 cols ── */}
            {/* DATA SOURCE: TOP_POSTS_MOCK — replace with real posts sorted by upvotes DESC */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.44, duration: 0.32 }}
              className="bg-card border-border overflow-hidden rounded-2xl border lg:col-span-3"
            >
              <div className="border-border flex items-center justify-between border-b px-5 py-4">
                <div>
                  <div className="mb-0.5 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-400" />
                    <span className="text-base font-black tracking-widest uppercase">
                      Top Posts by Upvotes
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Your most-loved pieces in the gallery
                  </p>
                </div>
                <Link
                  href="/profile"
                  className="text-primary flex shrink-0 items-center gap-1 text-sm font-semibold hover:underline"
                >
                  See all <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="divide-border divide-y">
                {dashboard.topPosts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.06, duration: 0.25 }}
                    className="hover:bg-muted/40 group flex cursor-pointer items-center gap-3 px-5 py-3.5 transition-colors"
                  >
                    <span className="ztext-sm text-muted-foreground w-4 shrink-0 text-center font-black">
                      #{i + 1}
                    </span>
                    {/* TODO: Replace with <Image src={post.thumbnailUrl} ... /> when real thumbnails are available */}
                    <div
                      className={`h-11 w-11 rounded-xl bg-gradient-to-br ${post.color} shrink-0`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-bold">
                        {post.title}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {post.category} · {post.timeAgo}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-0.5">
                      <div className="flex items-center gap-1">
                        <ArrowUp className="h-3 w-3 text-orange-400" />
                        <span className="text-foreground text-base font-black">
                          {post.upvotes.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {post.trend === "up" ? (
                          <TrendingUp className="h-3 w-3 text-green-400" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-400" />
                        )}
                        <span
                          className={`text-sm font-semibold ${post.trend === "up" ? "text-green-500" : "text-red-400"}`}
                        >
                          {post.trend === "up" ? "Gaining" : "Slowing"}
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="text-muted-foreground h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* ── Recent Activity — 2 cols ── */}
            {/* DATA SOURCE: RECENT_ACTIVITY_MOCK — replace with real event log */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48, duration: 0.32 }}
              className="bg-card border-border overflow-hidden rounded-2xl border lg:col-span-2"
            >
              <div className="border-border flex items-center gap-2 border-b px-5 py-4">
                <Clock className="h-4 w-4 text-purple-400" />
                <span className="text-base font-black tracking-widest uppercase">
                  Recent Activity
                </span>
              </div>
              <div className="space-y-1 px-4 py-3">
                {dashboard.recentActivity.map((item, i) => {
                  const config = activityToneMap[item.tone];
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.54 + i * 0.06 }}
                      className="border-border flex items-start gap-3 border-b py-2.5 last:border-0"
                    >
                      <div
                        className={`h-7 w-7 rounded-lg ${config.bg} mt-0.5 flex shrink-0 items-center justify-center`}
                      >
                        <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground text-sm leading-snug font-medium">
                          {item.text}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-sm">
                          {item.time}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* ── Blockchain Banner ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.66, duration: 0.32 }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 md:p-8"
          >
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(96,165,250,1) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="pointer-events-none absolute top-1/2 left-1/3 h-28 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="relative z-10 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/20">
                  <Hash className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <p className="text-base leading-tight font-black text-white">
                    {dashboard.protectedArtworks} Artworks Protected
                  </p>
                  <p className="mt-0.5 text-sm text-slate-400">
                    Backed by secure ownership records and integrity checks
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Duplicate Check", value: "pHash + Threshold" },
                  { label: "Integrity", value: "Crypto Hash" },
                  { label: "Ledger", value: "DB + Blockchain" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-sm"
                  >
                    <p className="text-sm tracking-wide text-slate-400 uppercase">
                      {s.label}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-white">
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
              <Link href="/plagiarism-checker" className="shrink-0">
                <button className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-base font-bold text-white shadow-[0_0_20px_rgba(59,130,246,0.35)] transition-all hover:bg-orange-600">
                  <ImageIcon className="h-3.5 w-3.5" /> Check Plagiarism?
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
