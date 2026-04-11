"use client";

import { AlertTriangle, LoaderCircle } from "lucide-react";

import { VerifyArtworkComparisonTable } from "./VerifyArtworkComparisonTable";
import { VerifyArtworkEmptyState } from "./VerifyArtworkEmptyState";
import { VerifyArtworkHero } from "./VerifyArtworkHero";
import { VerifyArtworkResultStates } from "./VerifyArtworkResultStates";
import { VerifyArtworkSelector } from "./VerifyArtworkSelector";
import { VerifyArtworkSummary } from "./VerifyArtworkSummary";
import { useVerifyArtwork } from "../hooks/useVerifyArtwork";

export default function VerifyArtworkPage() {
    const {
        filteredArtworks,
        selectedArtworkId,
        setSelectedArtworkId,
        search,
        setSearch,
        isLoadingArtworks,
        artworksError,
        verification,
        isVerifying,
        verificationError,
        runVerification,
    } = useVerifyArtwork();

    return (
        <main className="min-h-screen bg-background mt-12">
            <VerifyArtworkHero />

            <section className="container mx-auto space-y-6 px-4 py-8 md:px-6 md:py-10">
                <div className="rounded-3xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-blue-700 dark:text-blue-400">
                    This module verifies whether the selected registered artwork still
                    matches its stored blockchain ownership record. It compares the
                    local database values against the live on-chain proof of authorship.
                </div>

                {artworksError ? (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-red-500">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5" />
                            <div>
                                <h2 className="font-semibold">Unable to load artworks</h2>
                                <p className="mt-1 text-sm text-red-500/80">{artworksError}</p>
                            </div>
                        </div>
                    </div>
                ) : null}

                <VerifyArtworkSelector
                    search={search}
                    onSearchChange={setSearch}
                    items={filteredArtworks}
                    selectedArtworkId={selectedArtworkId}
                    onSelectArtwork={setSelectedArtworkId}
                    onVerify={runVerification}
                    isVerifying={isVerifying}
                />

                {isLoadingArtworks ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Loading your artworks...
                    </div>
                ) : null}

                {!isLoadingArtworks && filteredArtworks.length === 0 ? (
                    <VerifyArtworkEmptyState
                        title="No artworks available for verification"
                        description="Register an artwork first, or try a different search term."
                    />
                ) : null}

                {verificationError ? (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-red-500">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5" />
                            <div>
                                <h2 className="font-semibold">Verification failed</h2>
                                <p className="mt-1 text-sm text-red-500/80">{verificationError}</p>
                            </div>
                        </div>
                    </div>
                ) : null}

                {verification ? (
                    <>
                        <VerifyArtworkSummary result={verification} />
                        <VerifyArtworkResultStates result={verification} />
                        {verification.comparisons.length > 0 ? (
                            <VerifyArtworkComparisonTable items={verification.comparisons} />
                        ) : null}
                    </>
                ) : (
                    <VerifyArtworkEmptyState
                        title="No verification result yet"
                        description="Select one of your registered artworks and run the ownership verification check."
                    />
                )}
            </section>
        </main>
    );
}