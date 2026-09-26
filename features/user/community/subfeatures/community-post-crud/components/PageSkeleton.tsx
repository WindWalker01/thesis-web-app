function SkeletonBlock({
    className = "",
}: {
    className?: string;
}) {
    return <div className={`animate-pulse rounded-xl bg-muted/60 ${className}`} />;
}

export default function PostPageSkeleton() {
    return (
        <div className="min-h-screen overflow-x-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
            <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
                <div className="mb-8 max-w-2xl">
                    <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
                        <SkeletonBlock className="h-3 w-20 bg-primary/20" />
                    </div>

                    <SkeletonBlock className="mt-4 h-10 w-full max-w-md" />

                    <div className="mt-3 space-y-2">
                        <SkeletonBlock className="h-4 w-full max-w-2xl" />
                        <SkeletonBlock className="h-4 w-full max-w-xl" />
                    </div>
                </div>

                <section className="w-full rounded-3xl border border-border/70 bg-card/90 p-5 shadow-sm backdrop-blur-xl md:p-7">
                    <div className="mb-8 flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                            <SkeletonBlock className="h-5 w-5 rounded-md bg-primary/20" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <SkeletonBlock className="h-6 w-48" />
                            <SkeletonBlock className="mt-2 h-4 w-full max-w-sm" />
                            <SkeletonBlock className="mt-2 h-4 w-full max-w-xs" />
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
                            <div className="space-y-4">
                                <div>
                                    <SkeletonBlock className="h-4 w-28" />
                                    <SkeletonBlock className="mt-2 h-3 w-64" />
                                </div>

                                <SkeletonBlock className="h-11 w-full rounded-2xl" />

                                <div className="rounded-2xl border border-border bg-background">
                                    <div className="max-h-[440px] overflow-hidden p-3">
                                        <div className="space-y-3">
                                            {Array.from({ length: 4 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="flex w-full items-start gap-4 rounded-2xl border border-border bg-background p-3"
                                                >
                                                    <SkeletonBlock className="h-20 w-20 shrink-0 rounded-xl" />

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0 flex-1">
                                                                <SkeletonBlock className="h-4 w-40" />
                                                                <SkeletonBlock className="mt-2 h-3 w-24" />
                                                            </div>

                                                            <SkeletonBlock className="h-5 w-16 rounded-full" />
                                                        </div>

                                                        <SkeletonBlock className="mt-3 h-3 w-full" />
                                                        <SkeletonBlock className="mt-2 h-3 w-5/6" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <SkeletonBlock className="h-4 w-32" />
                                    <SkeletonBlock className="mt-2 h-3 w-52" />
                                </div>

                                <div className="overflow-hidden rounded-2xl border border-border bg-background">
                                    <SkeletonBlock className="aspect-[16/10] w-full rounded-none" />

                                    <div className="space-y-2 p-4">
                                        <SkeletonBlock className="h-5 w-32" />
                                        <SkeletonBlock className="h-3 w-full" />
                                        <SkeletonBlock className="h-3 w-11/12" />
                                        <SkeletonBlock className="h-3 w-2/3" />
                                        <SkeletonBlock className="pt-2 h-3 w-28" />
                                    </div>
                                </div>

                                <div>
                                    <SkeletonBlock className="mb-2 h-4 w-20" />
                                    <SkeletonBlock className="h-11 w-full rounded-2xl" />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 border-t border-border/60 pt-6">
                            <SkeletonBlock className="h-10 w-32 rounded-xl" />
                            <SkeletonBlock className="h-10 w-24 rounded-xl" />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}