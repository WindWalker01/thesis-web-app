import { CopyButton } from "../../artwork-detail/components/CopyButton";

export function HashRow({
    label,
    value,
}: {
    label: string;
    value: string | null;
}) {
    return (
        <div className="rounded-2xl border border-border bg-background/60 p-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                        {label}
                    </p>
                    <p className="text-sm text-foreground break-all">
                        {value ?? "No value recorded"}
                    </p>
                </div>

                {value ? <CopyButton value={value} label="Copy" /> : null}
            </div>
        </div>
    );
}
