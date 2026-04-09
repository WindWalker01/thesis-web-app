"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

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

export default function LogoutConfirmModal({
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
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onClick={onCancel}
                >
                    <motion.div
                        initial={{ scale: 0.94, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.94, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="w-full max-w-sm rounded-2xl border border-border bg-background p-8"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
                            {icon}
                        </div>

                        <h3 className="mb-2 text-center text-lg font-black">{title}</h3>

                        <p className="mb-6 text-center text-sm text-slate-400">
                            {description}
                        </p>

                        <div className="flex gap-3">
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
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}