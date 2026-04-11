"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { getVerifiableArtworks } from "../server/get-verifiable-artwork";
import { verifyArtworkOwnership } from "../server/verify-artwork-ownership";
import { verifyArtworkSchema } from "../schemas/verify-artwork-schema";

export function useVerifyArtwork() {
    const [selectedArtworkId, setSelectedArtworkId] = useState("");
    const [search, setSearch] = useState("");

    const artworksQuery = useQuery({
        queryKey: ["verify-artwork", "artworks"],
        queryFn: async () => {
            const result = await getVerifiableArtworks();

            if (!result.success) {
                throw new Error(result.message);
            }

            return result.items;
        },
        staleTime: 30_000,
    });

    const artworks = artworksQuery.data ?? [];

    useEffect(() => {
        if (!selectedArtworkId && artworks.length > 0) {
            setSelectedArtworkId(artworks[0].id);
        }
    }, [artworks, selectedArtworkId]);

    const filteredArtworks = useMemo(() => {
        const needle = search.trim().toLowerCase();

        if (!needle) return artworks;

        return artworks.filter((artwork) => {
            return (
                artwork.title.toLowerCase().includes(needle) ||
                artwork.status.toLowerCase().includes(needle) ||
                artwork.workId?.toLowerCase().includes(needle) ||
                artwork.txHash?.toLowerCase().includes(needle)
            );
        });
    }, [artworks, search]);

    const selectedArtwork = useMemo(() => {
        return artworks.find((item) => item.id === selectedArtworkId) ?? null;
    }, [artworks, selectedArtworkId]);

    const verifyMutation = useMutation({
        mutationFn: async (artworkId: string) => {
            const parsed = verifyArtworkSchema.safeParse({ artworkId });

            if (!parsed.success) {
                throw new Error(parsed.error.issues[0]?.message ?? "Invalid artwork selection.");
            }

            const result = await verifyArtworkOwnership(parsed.data.artworkId);

            if (!result.success) {
                throw new Error(result.message);
            }

            return result.data;
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : "Verification failed.");
        },
    });

    function runVerification() {
        if (!selectedArtworkId) {
            toast.error("Please select an artwork first.");
            return;
        }

        verifyMutation.mutate(selectedArtworkId);
    }

    return {
        artworks,
        filteredArtworks,
        selectedArtwork,
        selectedArtworkId,
        setSelectedArtworkId,
        search,
        setSearch,
        isLoadingArtworks: artworksQuery.isLoading,
        artworksError:
            artworksQuery.error instanceof Error ? artworksQuery.error.message : "",
        verification: verifyMutation.data ?? null,
        isVerifying: verifyMutation.isPending,
        verificationError:
            verifyMutation.error instanceof Error ? verifyMutation.error.message : "",
        runVerification,
        refreshArtworks: () => void artworksQuery.refetch(),
        clearVerification: () => verifyMutation.reset(),
    };
}