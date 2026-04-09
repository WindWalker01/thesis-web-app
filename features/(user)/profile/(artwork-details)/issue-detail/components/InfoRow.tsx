export function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-border bg-background/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                {label}
            </p>
            <p className="text-sm text-foreground wrap-break-word">{value}</p>
        </div>
    );
}
