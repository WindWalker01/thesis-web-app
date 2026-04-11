export default function ClassifyPageSkeleton() {
    return (
        <main className="min-h-screen bg-background">
            <section className="border-b bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-20 text-white">
                <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
                    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
                        <div className="space-y-4">
                            <div className="h-7 w-52 animate-pulse rounded-full bg-white/10" />

                            <div className="space-y-3">
                                <div className="h-10 w-full max-w-[420px] animate-pulse rounded-xl bg-white/10 sm:h-12" />
                                <div className="h-4 w-full max-w-[620px] animate-pulse rounded bg-white/10" />
                                <div className="h-4 w-full max-w-[520px] animate-pulse rounded bg-white/10" />
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                            {[1, 2, 3].map((item) => (
                                <div
                                    key={item}
                                    className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                                >
                                    <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
                                    <div className="mt-3 h-4 w-28 animate-pulse rounded bg-white/10" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4 py-8 md:px-6 md:py-10">
                <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="rounded-2xl border bg-card shadow-sm">
                        <div className="border-b bg-muted/30 p-6">
                            <div className="h-6 w-52 animate-pulse rounded bg-muted" />
                            <div className="mt-3 h-4 w-72 animate-pulse rounded bg-muted" />
                        </div>

                        <div className="space-y-6 p-6">
                            <div className="rounded-2xl border-2 border-dashed p-6">
                                <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 text-center">
                                    <div className="h-16 w-16 animate-pulse rounded-2xl bg-primary/10" />
                                    <div className="space-y-2">
                                        <div className="h-5 w-56 animate-pulse rounded bg-muted mx-auto" />
                                        <div className="h-4 w-64 animate-pulse rounded bg-muted mx-auto" />
                                    </div>

                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                        {["1", "2", "3"].map((item) => (
                                            <div
                                                key={item}
                                                className="h-6 w-14 animate-pulse rounded-full border bg-muted/50"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <div className="h-10 w-40 animate-pulse rounded-xl bg-muted" />
                                <div className="h-10 w-32 animate-pulse rounded-xl bg-muted" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-2xl border bg-card shadow-sm">
                            <div className="p-6">
                                <div className="h-6 w-48 animate-pulse rounded bg-muted" />
                                <div className="mt-3 h-4 w-80 animate-pulse rounded bg-muted" />
                            </div>

                            <div className="space-y-5 p-6 pt-0">
                                <div className="rounded-2xl border bg-primary/5 p-5">
                                    <div className="h-4 w-32 animate-pulse rounded bg-primary/10" />
                                    <div className="mt-4 h-8 w-48 animate-pulse rounded bg-primary/10" />
                                    <div className="mt-3 h-4 w-full animate-pulse rounded bg-primary/10" />
                                    <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-primary/10" />
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3">
                                    {[1, 2, 3].map((item) => (
                                        <div
                                            key={item}
                                            className="rounded-2xl border bg-card p-4"
                                        >
                                            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                                            <div className="mt-3 h-5 w-24 animate-pulse rounded bg-muted" />
                                            <div className="mt-2 h-4 w-28 animate-pulse rounded bg-muted" />
                                            <div className="mt-4 h-2 w-full animate-pulse rounded-full bg-muted" />
                                        </div>
                                    ))}
                                </div>

                                <div className="h-px w-full bg-border" />

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="space-y-2">
                                            <div className="h-4 w-36 animate-pulse rounded bg-muted" />
                                            <div className="h-3 w-52 animate-pulse rounded bg-muted" />
                                        </div>

                                        <div className="h-10 w-44 animate-pulse rounded-xl bg-muted" />
                                    </div>

                                    {[1, 2, 3, 4].map((item) => (
                                        <div
                                            key={item}
                                            className="rounded-xl border p-4"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-7 w-7 animate-pulse rounded-full bg-muted" />
                                                    <div className="space-y-2">
                                                        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                                                        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                                                    </div>
                                                </div>

                                                <div className="space-y-2 text-right">
                                                    <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                                                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                                                </div>
                                            </div>

                                            <div className="mt-4 h-2 w-full animate-pulse rounded-full bg-muted" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-orange-200 bg-orange-500/5 p-6 shadow-sm dark:border-orange-900/60">
                            <div className="h-5 w-36 animate-pulse rounded bg-orange-200/40 dark:bg-orange-900/40" />
                            <div className="mt-3 h-4 w-64 animate-pulse rounded bg-orange-200/40 dark:bg-orange-900/40" />
                            <div className="mt-5 space-y-3">
                                <div className="h-4 w-full animate-pulse rounded bg-orange-200/40 dark:bg-orange-900/40" />
                                <div className="h-4 w-5/6 animate-pulse rounded bg-orange-200/40 dark:bg-orange-900/40" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}