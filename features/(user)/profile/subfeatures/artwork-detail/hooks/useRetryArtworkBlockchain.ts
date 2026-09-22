"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { retryArtworkOnBlockchain } from "@/features/(user)/upload-artwork/server/retry-artwork-blockchain";
import { canRetryBlockchain } from "@/features/(user)/profile/lib/artwork-permissions";
import { artworkKeys } from "@/features/(user)/profile/hooks/useFetchProfileArtworks";
import { artworkDetailKeys } from "./useArtworkDetailPage";

type UseRetryArtworkBlockchainParams = {
    artId: string;
    status: string;
    txHash?: string | null;
    chain?: string | null;
    workId?: string | null;
    blockNumber?: number | null;
};

/**
 * Encapsulates the user-facing "retry blockchain registration" action for an
 * artwork whose protection write failed or is still pending. Used both by the
 * artwork actions menu and by the prominent banners on the detail pages.
 */
export function useRetryArtworkBlockchain({
    artId,
    status,
    txHash = null,
    chain = null,
    workId = null,
    blockNumber = null,
}: UseRetryArtworkBlockchainParams) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [isRetrying, setIsRetrying] = useState(false);

    const canRetry = useMemo(
        () =>
            canRetryBlockchain({
                status,
                txHash,
                chain,
                workId,
                blockNumber,
            }),
        [status, txHash, chain, workId, blockNumber]
    );

    async function retry() {
        if (!canRetry || isRetrying) return;

        setIsRetrying(true);
        const toastId = toast.loading("Retrying blockchain registration...");

        try {
            const result = await retryArtworkOnBlockchain({ artworkId: artId });

            if (!result.success) {
                toast.error("Blockchain retry failed", {
                    id: toastId,
                    description: result.message,
                });
                return;
            }

            await queryClient.invalidateQueries({ queryKey: artworkKeys.all() });
            await queryClient.invalidateQueries({
                queryKey: artworkDetailKeys.byId(artId),
            });
            router.refresh();

            toast.success("Artwork registered on blockchain", {
                id: toastId,
                description: "Your artwork is now verified on-chain.",
            });
        } finally {
            setIsRetrying(false);
        }
    }

    return { canRetry, isRetrying, retry };
}
