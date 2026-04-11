"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
    editArtworkSchema,
    type EditArtworkFormValues,
} from "../../../schemas/edit-artwork-schema";
import {
    deleteArtwork,
    updateArtworkMetadata,
} from "../server/edit-artwork";
import { artworkKeys } from "@/features/(user)/profile/hooks/useFetchProfileArtworks";
import { artworkDetailKeys } from "./useArtworkDetailPage";
import {
    canDeleteArtwork,
    canEditArtwork,
    hasBlockchainRecord,
} from "@/features/(user)/profile/lib/artwork-permissions";

type UseArtworkActionsParams = {
    artId: string;
    title: string;
    description: string | null;
    status: string;
    txHash?: string | null;
    chain?: string | null;
    workId?: string | null;
    blockNumber?: number | null;
    redirectOnDelete?: string;
};

export function useArtworkActions({
    artId,
    title,
    description,
    status,
    txHash = null,
    chain = null,
    workId = null,
    blockNumber = null,
    redirectOnDelete,
}: UseArtworkActionsParams) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const canEdit = useMemo(
        () =>
            canEditArtwork({
                status,
                txHash,
                chain,
                workId,
                blockNumber,
            }),
        [status, txHash, chain, workId, blockNumber]
    );

    const canDelete = useMemo(
        () =>
            canDeleteArtwork({
                status,
                txHash,
                chain,
                workId,
                blockNumber,
            }),
        [status, txHash, chain, workId, blockNumber]
    );

    const blockchainRecorded = useMemo(
        () =>
            hasBlockchainRecord({
                txHash,
                chain,
                workId,
                blockNumber,
            }),
        [txHash, chain, workId, blockNumber]
    );

    const form = useForm<EditArtworkFormValues>({
        resolver: zodResolver(editArtworkSchema),
        defaultValues: {
            title,
            description: description ?? "",
        },
    });

    useEffect(() => {
        form.reset({
            title,
            description: description ?? "",
        });
    }, [title, description, form]);

    async function invalidateArtworkCaches() {
        await queryClient.invalidateQueries({ queryKey: artworkKeys.all() });
        await queryClient.invalidateQueries({
            queryKey: artworkDetailKeys.byId(artId),
        });
        router.refresh();
    }

    async function handleSave(values: EditArtworkFormValues) {
        if (!canEdit) {
            toast.error(
                blockchainRecorded
                    ? "This artwork can no longer be edited because it already has a blockchain record."
                    : "This artwork cannot be edited in its current status."
            );
            return;
        }

        setIsSaving(true);
        form.clearErrors("root");

        const result = await updateArtworkMetadata(artId, values);

        setIsSaving(false);

        if (!result.success) {
            form.setError("root", { message: result.message });
            toast.error("Update failed", { description: result.message });
            return;
        }

        await invalidateArtworkCaches();
        setEditOpen(false);

        toast.success("Artwork updated", {
            description: "The title and description were saved successfully.",
        });
    }

    async function handleDelete() {
        if (!canDelete) {
            toast.error(
                blockchainRecorded
                    ? "This artwork cannot be deleted because it already has a blockchain record."
                    : "Only flagged, under review, and pending blockchain artworks can be deleted."
            );
            return;
        }

        setIsDeleting(true);

        const result = await deleteArtwork(artId);

        setIsDeleting(false);

        if (!result.success) {
            toast.error("Delete failed", { description: result.message });
            return;
        }

        await invalidateArtworkCaches();
        setDeleteOpen(false);

        toast.success("Artwork deleted");

        if (redirectOnDelete) {
            router.push(redirectOnDelete);
        }
    }

    return {
        form,
        editOpen,
        setEditOpen,
        deleteOpen,
        setDeleteOpen,
        isSaving,
        isDeleting,
        canEdit,
        canDelete,
        blockchainRecorded,
        handleSave,
        handleDelete,
    };
}