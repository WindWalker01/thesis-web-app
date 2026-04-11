import { Blocks } from "lucide-react";

export function TransactionsEmptyState() {
    return (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted/40">
                <Blocks className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-bold">No blockchain transactions found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
                Once your contract emits register or revoke activity, it will appear
                here.
            </p>
        </div>
    );
}