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
            <p className="text-xs tracking-wide text-slate-400 uppercase">{label}</p>
            <p className="mt-1 text-sm font-semibold text-white">{value}</p>
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
        "max": "all time",
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
        verified: { icon: ShieldCheck, color: "text-green-400", bg: "bg-green-500/10" },
        issue: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
        upload: { icon: Upload, color: "text-blue-400", bg: "bg-blue-500/10" },
        default: { icon: Clock, color: "text-purple-400", bg: "bg-purple-500/10" },
    };

    if (isLoading) {
        return <DashboardPageSkeleton />;
    }

    if (error || !dashboard) {
        return (
            <main className="bg-background min-h-screen font-display text-foreground overflow-x-hidden">
                <section className="container mx-auto px-4 py-20 md:px-6">
                    <p className="text-sm text-red-400">{error ?? "Failed to load dashboard."}</p>
                </section>
            </main>
        );
    }

    return (
        <main className="bg-background min-h-screen font-display text-foreground overflow-x-hidden">

            {/* ── Hero Header ── */}
            <section className="border-b bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-20 text-white">
                <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
                    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
                        <div className="space-y-4">
                            <Badge variant="secondary" className="w-fit gap-2 bg-white/10 text-white hover:bg-white/10">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                                Artist Dashboard
                            </Badge>
                            <div className="space-y-3">
                                <h1 className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                                    Welcome back
                                </h1>
                                <p className="max-w-xl text-sm text-slate-300 sm:text-base">
                                    Track your uploads, monitor blockchain protection, and see how
                                    the community is engaging with your work — all in one place.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <Link href="/upload-artwork">
                                    <button className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(59,130,246,0.35)] transition hover:bg-blue-600">
                                        <Upload className="h-3.5 w-3.5" /> Upload Art
                                    </button>
                                </Link>
                                <Link href="/profile">
                                    <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10">
                                        <Eye className="h-3.5 w-3.5" /> View Gallery
                                    </button>
                                </Link>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2.5">
                            <HeroStatCard label="Artworks" value={dashboard.heroStats.artworks} />
                            <HeroStatCard label="Verified" value={dashboard.heroStats.verified} />
                            <HeroStatCard label="Upvotes" value={dashboard.heroStats.upvotes} />
                            <HeroStatCard label="pHash Check" value={dashboard.heroStats.phashCheck} />
                            <HeroStatCard label="Crypto Hash" value={dashboard.heroStats.cryptoHash} />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Body ── */}
            <section className="container mx-auto px-4 py-8 md:px-6 md:py-10">
                <div className="space-y-6">

                    {/* ── Stat Cards ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {statCards.map((card, i) => {
                            const Icon = card.icon;
                            return (
                                <motion.div
                                    key={card.label}
                                    initial={{ opacity: 0, y: 18 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.07, duration: 0.32 }}
                                    className={`bg-card border ${card.border} rounded-2xl p-5 hover:-translate-y-0.5 transition-all duration-300`}
                                >
                                    <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-4`}>
                                        <Icon className={`w-4 h-4 ${card.color}`} />
                                    </div>
                                    <p className="text-2xl font-black text-foreground">{card.value}</p>
                                    <p className="text-xs font-bold text-foreground mt-0.5">{card.label}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{card.hint}</p>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* ── Chart Row ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

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
                            className="lg:col-span-3 bg-card border border-border rounded-2xl overflow-hidden"
                        >
                            {/* Card header */}
                            <div className="px-5 pt-5 pb-4 border-b border-border">
                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                    {/* Title + total */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <BarChart2 className="w-4 h-4 text-orange-400" />
                                            <span className="text-sm font-black uppercase tracking-widest">Upvotes</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">
                                            Total upvotes your posts received {rangeLabel[activeRange]}
                                        </p>
                                    </div>

                                    {/* ── Time-range filter tabs ── */}
                                    <div className="flex items-center gap-1 bg-muted/60 rounded-xl p-1 border border-border">
                                        {TIME_RANGE_OPTIONS.map(({ key, label }) => (
                                            <button
                                                key={key}
                                                onClick={() => setActiveRange(key)}
                                                className={`relative px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 ${activeRange === key
                                                    ? "text-foreground"
                                                    : "text-muted-foreground hover:text-foreground"
                                                    }`}
                                            >
                                                {/* Sliding pill background */}
                                                {activeRange === key && (
                                                    <motion.span
                                                        layoutId="chart-range-pill"
                                                        className="absolute inset-0 rounded-lg bg-card border border-border shadow-sm z-0"
                                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
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
                                            className="text-2xl font-black text-foreground"
                                        >
                                            {chartTotal.toLocaleString()}
                                        </motion.p>
                                    </AnimatePresence>
                                    <span className="text-[10px] text-muted-foreground">upvotes {rangeLabel[activeRange]}</span>
                                </div>
                            </div>

                            {/* Chart body */}
                            <div className="px-5 pt-5 pb-4">
                                {/* Y-axis hints */}
                                <div className="flex justify-between items-center mb-1 px-0.5">
                                    <span className="text-[9px] text-muted-foreground">{chartMax.toLocaleString()}</span>
                                    <span className="text-[9px] text-muted-foreground">{Math.round(chartMax / 2).toLocaleString()}</span>
                                    <span className="text-[9px] text-muted-foreground">0</span>
                                </div>

                                {/* Bars */}
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeRange}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="flex items-end gap-1 h-36 border-b border-border"
                                    >
                                        {chartData.map((d, i) => {
                                            const isPeak = d.label === chartPeak.label;
                                            const heightPct = Math.max((d.votes / chartMax) * 100, 2);
                                            return (
                                                <div
                                                    key={d.label}
                                                    className="flex-1 flex flex-col items-center justify-end gap-0 group relative"
                                                    style={{ height: "100%" }}
                                                >
                                                    {/* Tooltip */}
                                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                                        <div className="bg-foreground text-background text-[9px] font-bold px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">
                                                            {d.votes.toLocaleString()} upvotes
                                                        </div>
                                                        {/* Arrow */}
                                                        <div className="w-2 h-2 bg-foreground rotate-45 mx-auto -mt-1" />
                                                    </div>

                                                    {/* Bar */}
                                                    <motion.div
                                                        className={`w-full rounded-t-md cursor-default transition-colors ${isPeak
                                                            ? "bg-orange-500 hover:bg-orange-400"
                                                            : "bg-orange-500/35 hover:bg-orange-500/60"
                                                            }`}
                                                        style={{ minHeight: 4 }}
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${heightPct}%` }}
                                                        transition={{ delay: i * 0.04, duration: 0.45, ease: "easeOut" }}
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
                                            <span className={`text-[9px] font-semibold leading-none ${d.label === chartPeak.label ? "text-orange-400" : "text-muted-foreground"
                                                }`}>
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
                                        className="text-[10px] text-muted-foreground mt-3"
                                    >
                                        🔥 Peak:{" "}
                                        <span className="text-foreground font-semibold">
                                            {chartPeak.label} — {chartPeak.votes.toLocaleString()} upvotes
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
                            className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden"
                        >
                            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
                                <Flame className="w-4 h-4 text-red-400" />
                                <span className="text-sm font-black uppercase tracking-widest">Engagement</span>
                            </div>
                            <div className="px-5 py-4 space-y-4">
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
                                            <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                                                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] text-muted-foreground">{item.label}</p>
                                                <p className={`font-black truncate ${"small" in item && item.small ? "text-xs" : "text-sm"} text-foreground`}>
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
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                        {/* ── Top Posts — 3 cols ── */}
                        {/* DATA SOURCE: TOP_POSTS_MOCK — replace with real posts sorted by upvotes DESC */}
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.44, duration: 0.32 }}
                            className="lg:col-span-3 bg-card border border-border rounded-2xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <TrendingUp className="w-4 h-4 text-blue-400" />
                                        <span className="text-sm font-black uppercase tracking-widest">Top Posts by Upvotes</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">Your most-loved pieces in the gallery</p>
                                </div>
                                <Link href="/profile" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 shrink-0">
                                    See all <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>
                            <div className="divide-y divide-border">
                                {dashboard.topPosts.map((post, i) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + i * 0.06, duration: 0.25 }}
                                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/40 transition-colors group cursor-pointer"
                                    >
                                        <span className="text-xs font-black text-muted-foreground w-4 shrink-0 text-center">
                                            #{i + 1}
                                        </span>
                                        {/* TODO: Replace with <Image src={post.thumbnailUrl} ... /> when real thumbnails are available */}
                                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${post.color} shrink-0`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold truncate">{post.title}</p>
                                            <p className="text-[10px] text-muted-foreground">{post.category} · {post.timeAgo}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-0.5 shrink-0">
                                            <div className="flex items-center gap-1">
                                                <ArrowUp className="w-3 h-3 text-orange-400" />
                                                <span className="text-sm font-black text-foreground">{post.upvotes.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {post.trend === "up"
                                                    ? <TrendingUp className="w-3 h-3 text-green-400" />
                                                    : <TrendingDown className="w-3 h-3 text-red-400" />
                                                }
                                                <span className={`text-[9px] font-semibold ${post.trend === "up" ? "text-green-500" : "text-red-400"}`}>
                                                    {post.trend === "up" ? "Gaining" : "Slowing"}
                                                </span>
                                            </div>
                                        </div>
                                        <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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
                            className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden"
                        >
                            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
                                <Clock className="w-4 h-4 text-purple-400" />
                                <span className="text-sm font-black uppercase tracking-widest">Recent Activity</span>
                            </div>
                            <div className="px-4 py-3 space-y-1">
                                {dashboard.recentActivity.map((item, i) => {
                                    const config = activityToneMap[item.tone];
                                    const Icon = config.icon;

                                    return (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.54 + i * 0.06 }}
                                            className="flex items-start gap-3 py-2.5 border-b border-border last:border-0"
                                        >
                                            <div className={`w-7 h-7 rounded-lg ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                                                <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-foreground leading-snug">{item.text}</p>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">{item.time}</p>
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
                        className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-white/10 p-6 md:p-8"
                    >
                        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(rgba(96,165,250,1) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-72 h-28 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-400/20 flex items-center justify-center shrink-0">
                                    <Hash className="w-5 h-5 text-blue-300" />
                                </div>
                                <div>
                                    <p className="text-white font-black text-base leading-tight">
                                        {dashboard.protectedArtworks} Artworks Protected
                                    </p>
                                    <p className="text-slate-400 text-xs mt-0.5">
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
                                    <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-sm">
                                        <p className="text-[10px] uppercase tracking-wide text-slate-400">{s.label}</p>
                                        <p className="mt-0.5 text-xs font-semibold text-white">{s.value}</p>
                                    </div>
                                ))}
                            </div>
                            <Link href="/plagiarism-checker" className="shrink-0">
                                <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.35)]">
                                    <ImageIcon className="w-3.5 h-3.5" /> Check Plagiarism?
                                </button>
                            </Link>
                        </div>
                    </motion.div>

                </div>
            </section>
        </main>
    );
}