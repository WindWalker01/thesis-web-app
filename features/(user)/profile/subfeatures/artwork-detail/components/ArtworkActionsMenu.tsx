"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, ShieldAlert } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmActionModal from "@/features/(user)/settings/components/ConfirmActionModal";
import { EditArtworkDialog } from "../../../components/EditArtworkDialog";
import { useArtworkActions } from "../hooks/useArtworkActions";

type Props = {
    artId: string;
    title: string;
    description: string | null;
    status: string;
    txHash?: string | null;
    chain?: string | null;
    workId?: string | null;
    blockNumber?: number | null;
    redirectOnDelete?: string;
    className?: string;
};

export function ArtworkActionsMenu({
    artId,
    title,
    description,
    status,
    txHash = null,
    chain = null,
    workId = null,
    blockNumber = null,
    redirectOnDelete,
    className,
}: Props) {
    const [menuOpen, setMenuOpen] = useState(false);

    const {
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
    } = useArtworkActions({
        artId,
        title,
        description,
        status,
        txHash,
        chain,
        workId,
        blockNumber,
        redirectOnDelete,
    });

    function openEditModal() {
        // Close menu first, then open dialog after Radix finishes animating out
        setMenuOpen(false);
        setTimeout(() => setEditOpen(true), 0);
    }

    function openDeleteModal() {
        setMenuOpen(false);
        setTimeout(() => setDeleteOpen(true), 0);
    }

    return (
        <>
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                {/* Always render the trigger — never conditionally unmount it */}
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className={
                            className ??
                            "rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        }
                        aria-label="Artwork actions"
                    >
                        <MoreHorizontal className="h-5 w-5" />
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align="end"
                    className="w-56 rounded-2xl"
                    // Stop clicks inside the menu from bubbling to the card Link
                    onClick={(e) => e.stopPropagation()}
                    // Ensure the menu portal sits below modals
                    style={{ zIndex: 40 }}
                >
                    <DropdownMenuLabel>Artwork actions</DropdownMenuLabel>

                    {blockchainRecorded ? (
                        <>
                            <DropdownMenuSeparator />
                            <div className="px-2 py-2 text-xs text-muted-foreground">
                                This artwork already has a blockchain record, so editing
                                and deletion are disabled.
                            </div>
                        </>
                    ) : null}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        disabled={!canEdit}
                        onSelect={(e) => {
                            e.preventDefault();
                            if (!canEdit) return;
                            openEditModal();
                        }}
                        className="flex cursor-pointer items-center gap-2"
                    >
                        <Pencil className="h-4 w-4" />
                        Edit artwork
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        disabled={!canDelete}
                        onSelect={(e) => {
                            e.preventDefault();
                            if (!canDelete) return;
                            openDeleteModal();
                        }}
                        className="flex cursor-pointer items-center gap-2 text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete artwork
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditArtworkDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                form={form}
                isSaving={isSaving}
                onSubmit={handleSave}
            />

            <ConfirmActionModal
                open={deleteOpen}
                title="Delete this artwork?"
                description="This will permanently remove the artwork and its related records from the app. This cannot be undone."
                icon={<ShieldAlert className="h-6 w-6 text-red-500" />}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                isLoading={isDeleting}
                loadingLabel="Deleting..."
                onCancel={() => setDeleteOpen(false)}
                onConfirm={handleDelete}
                confirmButtonClassName="bg-red-500 text-white hover:bg-red-600"
            />
        </>
    );
}