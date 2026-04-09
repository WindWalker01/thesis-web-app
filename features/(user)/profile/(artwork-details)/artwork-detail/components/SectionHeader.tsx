export function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-2 border-b border-border bg-background/60 px-5 py-3.5">
            <span className="text-primary">{icon}</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {title}
            </span>
        </div>
    );
}