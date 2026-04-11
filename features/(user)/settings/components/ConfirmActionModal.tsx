"use client";

import type { ReactNode } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type ConfirmActionModalProps = {
    open: boolean;
    title: string;
    description: string;
    icon: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
    loadingLabel?: string;
    onCancel: () => void;
    onConfirm: () => void;
    confirmButtonClassName?: string;
};

export default function ConfirmActionModal({
    open,
    title,
    description,
    icon,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    isLoading = false,
    loadingLabel = "Processing...",
    onCancel,
    onConfirm,
    confirmButtonClassName = "bg-red-500 hover:bg-red-600 text-white",
}: ConfirmActionModalProps) {
    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen && !isLoading) onCancel();
            }}
        >
            <DialogContent
                className="max-w-sm rounded-2xl p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <DialogHeader className="items-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
                        {icon}
                    </div>
                    <DialogTitle className="text-center text-lg font-black">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-center text-sm text-slate-400">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex-row gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {cancelLabel}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${confirmButtonClassName}`}
                    >
                        {isLoading ? loadingLabel : confirmLabel}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}