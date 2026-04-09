export function SimpleInfoRow({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="rounded-xl border border-border bg-background/70 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                {label}
            </p>
            <p
                className={
                    mono
                        ? "font-mono text-xs leading-5 break-all text-foreground"
                        : "text-sm font-medium text-foreground wrap-break-word"
                }
            >
                {value}
            </p>
        </div>
    );
}
