export function TransactionsSkeleton() {
    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card/70">
            <div className="hidden grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr_1fr_1fr_0.8fr] gap-4 border-b border-border bg-muted/40 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground md:grid">
                <div>Transaction Hash</div>
                <div>Method</div>
                <div>Block</div>
                <div>Age</div>
                <div>From</div>
                <div>To</div>
                <div>Status</div>
            </div>

            <div className="divide-y divide-border">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div
                        key={index}
                        className="grid gap-3 px-5 py-4 md:grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr_1fr_1fr_0.8fr] md:items-center"
                    >
                        {Array.from({ length: 7 }).map((__, i) => (
                            <div
                                key={i}
                                className="h-4 animate-pulse rounded bg-muted"
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}