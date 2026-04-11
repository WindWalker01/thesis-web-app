"use client";

import { AlertTriangle } from "lucide-react";

import { TransactionsEmptyState } from "@/features/txs/components/TransactionsEmptyState";
import { TransactionsHero } from "@/features/txs/components/TransactionsHero";
import { TransactionsPagination } from "@/features/txs/components/TransactionsPagination";
import { TransactionsPrivacyNote } from "@/features/txs/components/TransactionsPrivacyNote";
import { TransactionsSkeleton } from "./TransactionSkeleton";
import { TransactionsTable } from "@/features/txs/components/TransactionsTable";
import { useBlockchainTransactions } from "../hooks/useBlockchainTransaction";

export default function BlockchainTransactionsPage() {
    const {
        items,
        page,
        hasNextPage,
        isLoading,
        errorMessage,
        contractAddress,
        chainLabel,
        sourceUsed,
        goToNextPage,
        goToPreviousPage,
        refresh,
    } = useBlockchainTransactions();

    return (
        <main className="min-h-screen bg-background">
            <TransactionsHero
                contractAddress={contractAddress}
                chainLabel={chainLabel}
                sourceUsed={sourceUsed}
            />

            <section className="container mx-auto space-y-6 px-4 py-8 md:px-6 md:py-10">
                <TransactionsPrivacyNote />

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

                {isLoading ? (
                    <TransactionsSkeleton />
                ) : items.length === 0 ? (
                    <TransactionsEmptyState />
                ) : (
                    <>
                        <TransactionsTable items={items} />
                        <TransactionsPagination
                            page={page}
                            hasNextPage={hasNextPage}
                            isLoading={isLoading}
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