import { ExternalLink, Link2, ShieldCheck, TimerReset } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDate, truncateHash } from "@/lib/client-utils";
import type { VerifyArtworkResultData } from "../types";
import { VerificationStatusBadge } from "./VerificationStatusBadge";

export function VerifyArtworkSummary({
    result,
}: {
    result: VerifyArtworkResultData;
}) {
    const txUrl = result.artwork.txHash
        ? `${result.explorerBaseUrl}/tx/${result.artwork.txHash}`
        : null;

    const contractUrl = `${result.explorerBaseUrl}/address/${result.contractAddress}`;

    return (
        <div className="rounded-3xl border border-border bg-card/80 p-5 backdrop-blur-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <VerificationStatusBadge status={result.status} />
                        <span className="text-xs text-muted-foreground">
                            Verified on {formatDate(result.verifiedAt)}
                        </span>
                    </div>

                    <div>
                        <h2 className="text-xl font-black">{result.artwork.title}</h2>
                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                            {result.summary}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" className="rounded-2xl">
                        <a href={contractUrl} target="_blank" rel="noreferrer">
                            <Link2 className="mr-2 h-4 w-4" />
                            Contract
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                    </Button>

                    {txUrl ? (
                        <Button asChild variant="outline" className="rounded-2xl">
                            <a href={txUrl} target="_blank" rel="noreferrer">
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                View transaction
                                <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                    ) : null}
                </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-border bg-background/70 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Chain
                    </div>
                    <div className="mt-2 text-sm font-bold">{result.chainLabel}</div>
                </div>

                <div className="rounded-2xl border border-border bg-background/70 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Work ID
                    </div>
                    <div className="mt-2 text-sm font-bold">{result.artwork.workId ?? "Not recorded"}</div>
                </div>

                <div className="rounded-2xl border border-border bg-background/70 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Transaction hash
                    </div>
                    <div className="mt-2 break-all text-sm font-bold">
                        {result.artwork.txHash ? truncateHash(result.artwork.txHash, 12, 10) : "—"}
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-background/70 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        On-chain timestamp
                    </div>
                    <div className="mt-2 text-sm font-bold">
                        {result.onChainWork?.createdAt
                            ? formatDate(result.onChainWork.createdAt)
                            : "—"}
                    </div>
                </div>
            </div>

            {result.onChainWork?.revoked ? (
                <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600 dark:text-red-400">
                    <div className="flex items-start gap-2">
                        <TimerReset className="mt-0.5 h-4 w-4 shrink-0" />
                        <div>
                            This artwork record exists on-chain, but it is marked as revoked.
                            {result.onChainWork.revokedAt
                                ? ` Revoked at ${formatDate(result.onChainWork.revokedAt)}.`
                                : null}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}