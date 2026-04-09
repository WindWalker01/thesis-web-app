"use client";

import Image from "next/image";
import {
    AlertTriangle,
    CheckCircle2,
    FileImage,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { UploadArtworkFormValues } from "@/features/(user)/upload-artwork/schemas/artwork-schema";

type ConfirmUploadModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    values: UploadArtworkFormValues | null;
    previewUrl: string | null;
    isSubmitting: boolean;
    onConfirm: () => void;
};

export function ConfirmUploadModal({
    open,
    onOpenChange,
    values,
    previewUrl,
    isSubmitting,
    onConfirm,
}: ConfirmUploadModalProps) {
    const file = values?.file;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="
          flex max-h-[92vh] w-[calc(100vw-1rem)] max-w-[560px] flex-col overflow-hidden
          rounded-2xl border bg-background p-0
          sm:w-[calc(100vw-2rem)] sm:max-w-[720px]
          lg:max-w-[980px]
        "
            >
                <div className="border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-4 py-4 text-white sm:px-6 sm:py-5 lg:px-7 lg:py-6">
                    <DialogHeader className="space-y-3 text-left">
                        <Badge
                            variant="secondary"
                            className="w-fit gap-2 bg-white/10 text-white hover:bg-white/10"
                        >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Confirm artwork upload
                        </Badge>

                        <div className="space-y-1">
                            <DialogTitle className="text-lg font-semibold text-white sm:text-xl">
                                Review your artwork before submission
                            </DialogTitle>
                            <DialogDescription className="max-w-2xl text-sm leading-6 text-slate-300">
                                Please confirm the details below. After submission, your artwork
                                will proceed to originality checking, secure registration, and
                                protection flow.
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-7 lg:py-7">
                    <div className="space-y-4 sm:space-y-5">
                        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-6">
                            <div className="space-y-3">
                                <div className="overflow-hidden rounded-xl border bg-muted/30 lg:rounded-2xl">
                                    {file && previewUrl ? (
                                        <div className="relative aspect-[4/3] w-full">
                                            <Image
                                                src={previewUrl}
                                                alt={file.name}
                                                fill
                                                unoptimized
                                                className="object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex aspect-[4/3] items-center justify-center">
                                            <FileImage className="h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" />
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-xl border p-3 sm:p-4 lg:rounded-2xl">
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Selected file
                                    </p>
                                    <p className="mt-2 truncate text-sm font-semibold">
                                        {file?.name ?? "No file selected"}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "—"}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="rounded-xl border p-3 sm:p-4 lg:rounded-2xl">
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Artwork title
                                    </p>
                                    <p className="mt-2 break-words text-sm font-semibold leading-6">
                                        {values?.title?.trim() || "Untitled artwork"}
                                    </p>
                                </div>

                                <div className="rounded-xl border p-3 sm:p-4 lg:rounded-2xl">
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Description
                                    </p>
                                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                                        {values?.description?.trim() || "No description provided."}
                                    </p>
                                </div>

                                <div className="rounded-xl border p-3 sm:p-4 lg:rounded-2xl">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold">
                                                Ownership confirmation
                                            </p>
                                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                                {values?.rightsConfirmed
                                                    ? "You confirmed that you own this artwork or are authorized to register it."
                                                    : "Ownership confirmation was not provided."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 sm:p-4 lg:rounded-2xl">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold">Important reminder</p>
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        Submission does not always mean immediate blockchain protection.
                                        If a notable similarity result is detected, the artwork may be
                                        flagged or placed under review first.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-xl border bg-muted/20 p-3 lg:rounded-2xl">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                                    Originality check
                                </div>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                    pHash-based similarity review
                                </p>
                            </div>

                            <div className="rounded-xl border bg-muted/20 p-3 lg:rounded-2xl">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                                    Secure registration
                                </div>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                    Artwork metadata and hashes are recorded
                                </p>
                            </div>

                            <div className="rounded-xl border bg-muted/20 p-3 lg:rounded-2xl">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                                    Final status
                                </div>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                    Success, review, or flagged outcome
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="border-t bg-muted/20 px-4 py-4 sm:px-6 lg:px-7">
                    <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full rounded-xl sm:w-auto"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Go back
                        </Button>

                        <Button
                            type="button"
                            className="w-full rounded-xl sm:w-auto"
                            onClick={onConfirm}
                            disabled={isSubmitting || !values}
                        >
                            {isSubmitting ? "Starting registration..." : "Confirm & upload"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}