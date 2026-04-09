import { CopyButton } from "./CopyButton";

export function HashInfoRow({ label, value }: { label: string; value: string }) {
    const canCopy = value !== "N/A";

    return (
        <div className="rounded-xl border border-border bg-background/70 px-4 py-3">
            <div className="flex items-center justify-between gap-3 mb-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {label}
                </p>
                {canCopy && <CopyButton value={value} label="Copy" />}
            </div>
            <p className="font-mono text-xs leading-5 break-all text-foreground">{value}</p>
        </div>
    );
}