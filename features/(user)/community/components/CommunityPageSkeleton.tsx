"use client";

function SkeletonBlock({
    className = "",
}: {
    className?: string;
}) {
    return <div className={`animate-pulse rounded-xl bg-muted/60 ${className}`} />;
}

function FilterChipSkeleton({ active = false }: { active?: boolean }) {
    return (
        <div
            className={[
                "rounded-full border px-3 py-1.5",
                active
                    ? "border-primary/20 bg-primary/10"
                    : "border-border bg-background",
            ].join(" ")}
        >
            <SkeletonBlock className="h-3 w-14" />
        </div>
    );
}

function InfoRowSkeleton() {
    return (
        <div className="rounded-2xl border border-border bg-background p-3">
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="mt-2 h-3 w-full" />
            <SkeletonBlock className="mt-2 h-3 w-5/6" />
        </div>
    );
}

function StatCardSkeleton() {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
            <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                <SkeletonBlock className="h-4 w-4 bg-white/10" />
            </div>
            <SkeletonBlock className="h-3 w-24 bg-white/10" />
            <SkeletonBlock className="mt-2 h-6 w-20 bg-white/10" />
        </div>
    );
}

function ArtPostSkeleton() {
    return (
        <article className="overflow-hidden rounded-3xl border border-border/70 bg-card/90 shadow-sm backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4 p-4 sm:p-5">
                <div className="flex min-w-0 items-center gap-3">
                    <SkeletonBlock className="h-11 w-11 shrink-0 rounded-full" />

                    <div className="min-w-0">
                        <SkeletonBlock className="h-4 w-28" />
                        <div className="mt-2 flex items-center gap-2">
                            <SkeletonBlock className="h-3 w-20" />
                            <SkeletonBlock className="h-3 w-3 rounded-full" />
                            <SkeletonBlock className="h-3 w-16" />
                            <SkeletonBlock className="h-3 w-3 rounded-full" />
                            <SkeletonBlock className="h-3 w-4" />
                        </div>
                    </div>
                </div>

                <SkeletonBlock className="h-9 w-9 rounded-full" />
            </div>

            <div className="px-4 pb-3 sm:px-5">
                <SkeletonBlock className="mb-3 h-6 w-24 rounded-full" />
                <SkeletonBlock className="h-6 w-3/4" />
                <SkeletonBlock className="mt-3 h-4 w-full" />
                <SkeletonBlock className="mt-2 h-4 w-5/6" />

                <div className="mt-3 flex flex-wrap gap-2">
                    <SkeletonBlock className="h-6 w-16 rounded-full" />
                    <SkeletonBlock className="h-6 w-20 rounded-full" />
                    <SkeletonBlock className="h-6 w-14 rounded-full" />
                </div>
            </div>

            <div className="border-y border-border/70 bg-muted/30">
                <SkeletonBlock className="aspect-[4/3] w-full rounded-none sm:aspect-[16/10] md:aspect-[16/9]" />
            </div>

            <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs text-muted-foreground sm:px-5">
                <div className="flex items-center gap-3">
                    <SkeletonBlock className="h-7 w-10 rounded-full" />
                    <SkeletonBlock className="h-3 w-36" />
                </div>
            </div>

            <div className="border-t border-border/70 px-3 py-2 sm:px-4">
                <div className="grid grid-cols-3 gap-2">
                    <SkeletonBlock className="h-11 rounded-2xl" />
                    <SkeletonBlock className="h-11 rounded-2xl" />
                    <div />
                </div>
            </div>
        </article>
    );
}

export default function CommunityPageSkeleton() {
    return (
        <main className="min-h-screen bg-background font-display text-foreground">
            <div className="h-1 w-full bg-linear-to-r from-blue-600 via-primary to-orange-400" />

            <section className="border-b border-border bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 text-white">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1">
                                <SkeletonBlock className="h-3 w-28 bg-white/10" />
                            </div>

                            <div className="space-y-3">
                                <SkeletonBlock className="h-10 w-full max-w-2xl bg-white/10" />
                                <SkeletonBlock className="h-10 w-4/5 max-w-xl bg-white/10" />

                                <div className="space-y-2">
                                    <SkeletonBlock className="h-4 w-full max-w-2xl bg-white/10" />
                                    <SkeletonBlock className="h-4 w-5/6 max-w-xl bg-white/10" />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <SkeletonBlock className="h-10 w-32 rounded-xl bg-white/10" />
                                <SkeletonBlock className="h-10 w-48 rounded-xl bg-white/10" />
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="space-y-5">
                        <div className="z-10 bg-background pb-1 pt-1">
                            <div className="rounded-3xl border border-border bg-card px-4 py-3 shadow-sm sm:px-5">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <SkeletonBlock className="h-7 w-60" />
                                        <SkeletonBlock className="mt-2 h-4 w-72" />
                                    </div>

                                    <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                                        <SkeletonBlock className="h-11 w-full rounded-xl sm:min-w-[280px] lg:w-[320px]" />
                                        <SkeletonBlock className="h-11 w-32 rounded-xl" />
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <SkeletonBlock className="h-3 w-28" />
                                    <div className="flex flex-wrap gap-2">
                                        <FilterChipSkeleton active />
                                        <FilterChipSkeleton />
                                        <FilterChipSkeleton />
                                        <FilterChipSkeleton />
                                        <FilterChipSkeleton />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <ArtPostSkeleton key={i} />
                            ))}
                        </div>
                    </div>

                    <aside className="sticky top-20 self-start space-y-4">
                        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                            <SkeletonBlock className="h-6 w-44" />
                            <div className="mt-4 space-y-3">
                                <InfoRowSkeleton />
                                <InfoRowSkeleton />
                                <InfoRowSkeleton />
                            </div>
                        </div>

                        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                            <SkeletonBlock className="h-6 w-44" />
                            <SkeletonBlock className="mt-4 h-4 w-full" />
                            <SkeletonBlock className="mt-2 h-4 w-full" />
                            <SkeletonBlock className="mt-2 h-4 w-5/6" />
                        </div>
                    </aside>
                </div>
            </section>
        </main>
    );
}