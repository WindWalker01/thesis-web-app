import { SearchX } from "lucide-react";

export function VerifyArtworkEmptyState({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-3xl border border-dashed border-border bg-card/60 p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <SearchX className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-black">{title}</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                {description}
            </p>
        </div>
    );
}