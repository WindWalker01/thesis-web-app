export function EmptyState({ text }: { text: string }) {
    return (
        <div className="rounded-2xl border border-dashed border-border bg-background/40 p-5">
            <p className="text-sm text-muted-foreground">{text}</p>
        </div>
    );
}
