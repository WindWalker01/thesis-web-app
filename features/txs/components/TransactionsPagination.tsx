import { ChevronLeft, ChevronRight, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function TransactionsPagination({
    page,
    hasNextPage,
    isFetching,
    onPrevious,
    onNext,
    onRefresh,
}: {
    page: number;
    hasNextPage: boolean;
    isFetching: boolean;
    onPrevious: () => void;
    onNext: () => void;
    onRefresh: () => void;
}) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
                Page <span className="font-semibold text-foreground">{page}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onRefresh}
                    disabled={isFetching}
                    className="rounded-xl"
                >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    onClick={onPrevious}
                    disabled={page <= 1 || isFetching}
                    className="rounded-xl"
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                </Button>

                <Button
                    type="button"
                    onClick={onNext}
                    disabled={!hasNextPage || isFetching}
                    className="rounded-xl bg-blue-500 text-white hover:bg-blue-600"
                >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}