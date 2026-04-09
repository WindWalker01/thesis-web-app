export function MetricCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-border bg-background/60 p-4">
            <div className="mb-3 inline-flex rounded-xl border border-border bg-card p-2 text-muted-foreground">
                {icon}
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                {label}
            </p>
            <p className="text-sm font-bold text-foreground">{value}</p>
        </div>
    );
}