"use client";

import type { CSSProperties } from "react";

function SkeletonBlock({
    className = "",
    style,
}: {
    className?: string;
    style?: CSSProperties;
}) {
    return (
        <div
            className={`animate-pulse rounded-xl bg-muted/60 ${className}`}
            style={style}
        />
    );
}

function HeroStatSkeleton() {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <SkeletonBlock className="h-3 w-16 bg-white/10" />
            <SkeletonBlock className="mt-2 h-4 w-20 bg-white/10" />
        </div>
    );
}

export default function DashboardPageSkeleton() {
    return (
        <main className="bg-background min-h-screen font-display text-foreground overflow-x-hidden">
            <section className="border-b bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-20 text-white">
                <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
                    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
                        <div className="space-y-4">
                            <div className="w-fit rounded-full border border-white/10 bg-white/10 px-3 py-1.5">
                                <SkeletonBlock className="h-3 w-28 bg-white/10" />
                            </div>

                            <div className="space-y-3">
                                <SkeletonBlock className="h-10 w-56 bg-white/10" />
                                <div className="space-y-2">
                                    <SkeletonBlock className="h-4 w-full max-w-xl bg-white/10" />
                                    <SkeletonBlock className="h-4 w-4/5 max-w-lg bg-white/10" />
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <SkeletonBlock className="h-10 w-32 rounded-xl bg-white/10" />
                                <SkeletonBlock className="h-10 w-32 rounded-xl bg-white/10" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5">
                            <HeroStatSkeleton />
                            <HeroStatSkeleton />
                            <HeroStatSkeleton />
                            <HeroStatSkeleton />
                            <HeroStatSkeleton />
                        </div>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4 py-8 md:px-6 md:py-10">
                <div className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="bg-card border border-border rounded-2xl p-5"
                            >
                                <SkeletonBlock className="mb-4 h-9 w-9 rounded-xl" />
                                <SkeletonBlock className="h-8 w-16" />
                                <SkeletonBlock className="mt-2 h-3 w-24" />
                                <SkeletonBlock className="mt-2 h-3 w-20" />
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div className="lg:col-span-3 bg-card border border-border rounded-2xl overflow-hidden">
                            <div className="px-5 pt-5 pb-4 border-b border-border">
                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                    <div className="space-y-2">
                                        <SkeletonBlock className="h-4 w-24" />
                                        <SkeletonBlock className="h-3 w-44" />
                                    </div>
                                    <SkeletonBlock className="h-9 w-44 rounded-xl" />
                                </div>
                                <SkeletonBlock className="mt-4 h-8 w-24" />
                            </div>

                            <div className="px-5 pt-5 pb-4">
                                <div className="flex items-end gap-1 h-36 border-b border-border">
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="flex-1 flex items-end"
                                        >
                                            <SkeletonBlock
                                                className="w-full rounded-t-md"
                                                style={{
                                                    height: `${20 + ((i % 6) + 1) * 12}%`,
                                                } as React.CSSProperties}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-1 pt-2">
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <div key={i} className="flex-1 text-center">
                                            <SkeletonBlock className="mx-auto h-2 w-6" />
                                        </div>
                                    ))}
                                </div>

                                <SkeletonBlock className="mt-4 h-3 w-40" />
                            </div>
                        </div>

                        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-border">
                                <SkeletonBlock className="h-4 w-28" />
                            </div>
                            <div className="px-5 py-4 space-y-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <SkeletonBlock className="h-8 w-8 rounded-lg" />
                                        <div className="flex-1">
                                            <SkeletonBlock className="h-3 w-24" />
                                            <SkeletonBlock className="mt-2 h-4 w-32" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div className="lg:col-span-3 bg-card border border-border rounded-2xl overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                                <div className="space-y-2">
                                    <SkeletonBlock className="h-4 w-40" />
                                    <SkeletonBlock className="h-3 w-32" />
                                </div>
                                <SkeletonBlock className="h-4 w-12" />
                            </div>

                            <div className="divide-y divide-border">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                                        <SkeletonBlock className="h-4 w-4" />
                                        <SkeletonBlock className="h-11 w-11 rounded-xl" />
                                        <div className="flex-1">
                                            <SkeletonBlock className="h-4 w-32" />
                                            <SkeletonBlock className="mt-2 h-3 w-24" />
                                        </div>
                                        <div className="w-16 space-y-2">
                                            <SkeletonBlock className="h-4 w-12 ml-auto" />
                                            <SkeletonBlock className="h-3 w-10 ml-auto" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-border">
                                <SkeletonBlock className="h-4 w-28" />
                            </div>
                            <div className="px-4 py-3 space-y-1">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
                                        <SkeletonBlock className="h-7 w-7 rounded-lg" />
                                        <div className="flex-1">
                                            <SkeletonBlock className="h-3 w-full" />
                                            <SkeletonBlock className="mt-2 h-2.5 w-20" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-white/10 p-6 md:p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
                            <div className="flex items-center gap-4">
                                <SkeletonBlock className="h-11 w-11 rounded-2xl bg-white/10" />
                                <div>
                                    <SkeletonBlock className="h-4 w-40 bg-white/10" />
                                    <SkeletonBlock className="mt-2 h-3 w-56 bg-white/10" />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-sm"
                                    >
                                        <SkeletonBlock className="h-2.5 w-16 bg-white/10" />
                                        <SkeletonBlock className="mt-2 h-3 w-20 bg-white/10" />
                                    </div>
                                ))}
                            </div>

                            <SkeletonBlock className="h-10 w-40 rounded-xl bg-white/10" />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}