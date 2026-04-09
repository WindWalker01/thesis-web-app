export default function IssueDetailPageSkeleton() {
    return (
        <main className="min-h-screen bg-background text-foreground mt-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-pulse">
                <div className="h-4 w-32 rounded bg-muted mb-8" />

                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-3xl border border-border bg-card p-5">
                        <div className="aspect-[4/3] rounded-2xl bg-muted mb-4" />
                        <div className="h-7 w-2/3 rounded bg-muted mb-3" />
                        <div className="h-4 w-full rounded bg-muted mb-2" />
                        <div className="h-4 w-5/6 rounded bg-muted" />
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-3xl border border-border bg-card p-5">
                            <div className="h-5 w-40 rounded bg-muted mb-4" />
                            <div className="grid grid-cols-2 gap-3">
                                <div className="h-20 rounded-xl bg-muted" />
                                <div className="h-20 rounded-xl bg-muted" />
                                <div className="h-20 rounded-xl bg-muted" />
                                <div className="h-20 rounded-xl bg-muted" />
                            </div>
                        </div>

                        <div className="rounded-3xl border border-border bg-card p-5">
                            <div className="h-5 w-52 rounded bg-muted mb-4" />
                            <div className="space-y-3">
                                <div className="h-14 rounded-xl bg-muted" />
                                <div className="h-14 rounded-xl bg-muted" />
                                <div className="h-14 rounded-xl bg-muted" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}