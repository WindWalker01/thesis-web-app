"use client";

import { AlertTriangle, LoaderCircle } from "lucide-react";

import { TransactionsEmptyState } from "@/features/txs/components/TransactionsEmptyState";
import { TransactionsHero } from "@/features/txs/components/TransactionsHero";
import { TransactionsPagination } from "@/features/txs/components/TransactionsPagination";
import { TransactionsPrivacyNote } from "@/features/txs/components/TransactionsPrivacyNote";
import { TransactionsSkeleton } from "./TransactionSkeleton";
import { TransactionsTable } from "@/features/txs/components/TransactionsTable";
import { TransactionsToolbar } from "@/features/txs/components/TransactionsToolbar";
import { useBlockchainTransactions } from "../hooks/useBlockchainTransaction";

export default function BlockchainTransactionsPage() {
    const {
        filteredItems,
        items,
        page,
        hasNextPage,
        isLoading,
        isFetching,
        errorMessage,
        contractAddress,
        chainLabel,
        sourceUsed,
        search,
        methodFilter,
        statusFilter,
        setSearch,
        setMethodFilter,
        setStatusFilter,
        clearFilters,
        goToNextPage,
        goToPreviousPage,
        refresh,
    } = useBlockchainTransactions();

    const showInitialSkeleton = isLoading && items.length === 0;
    const hasActiveFilters =
        search.trim() !== "" || methodFilter !== "all" || statusFilter !== "all";

    return (
        <main className="min-h-screen bg-background">
            <TransactionsHero
                contractAddress={contractAddress}
                chainLabel={chainLabel}
                sourceUsed={sourceUsed}
            />

            <section className="container mx-auto space-y-6 px-4 py-8 md:px-6 md:py-10">
                <TransactionsPrivacyNote />

                <TransactionsToolbar
                    search={search}
                    methodFilter={methodFilter}
                    statusFilter={statusFilter}
                    onSearchChange={setSearch}
                    onMethodFilterChange={setMethodFilter}
                    onStatusFilterChange={setStatusFilter}
                    onClearFilters={clearFilters}
                />

                {isFetching && !showInitialSkeleton ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Updating transactions...
                    </div>
                ) : null}

                {errorMessage ? (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-red-500">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5" />
                            <div>
                                <h2 className="font-semibold">Unable to load transactions</h2>
                                <p className="mt-1 text-sm text-red-500/80">{errorMessage}</p>
                            </div>
                        </div>
                    </div>
                ) : null}

                {showInitialSkeleton ? (
                    <TransactionsSkeleton />
                ) : filteredItems.length === 0 ? (
                    <TransactionsEmptyState
                        title={
                            hasActiveFilters
                                ? "No matching transactions on this page"
                                : "No blockchain transactions found"
                        }
                        description={
                            hasActiveFilters
                                ? "Try changing the search term or filters, or check another page."
                                : "Once your contract emits register or revoke activity, it will appear here."
                        }
                    />
                ) : (
                    <>
                        <TransactionsTable items={filteredItems} />
                        <TransactionsPagination
                            page={page}
                            hasNextPage={hasNextPage}
                            isFetching={isFetching}
                            onPrevious={goToPreviousPage}
                            onNext={goToNextPage}
                            onRefresh={refresh}
                        />
                    </>
                )}
            </section>
        </main>
    );
}