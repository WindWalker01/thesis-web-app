"use client";

import { useState } from "react";
import { Pencil, Tags, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/client-utils";
import type { Genre } from "../../../types";
import { useGenres } from "../hooks/useGenres";
import { useUpdateArtworkGenres } from "../hooks/useUpdateArtworkGenres";

type GenresSectionProps = {
    artId: string;
    genres: Genre[];
};

/**
 * "Genres" section on the artwork detail page. Shows the currently assigned
 * tags and lets the owner open a dialog to change them against the full genre
 * catalog. The server action independently re-verifies ownership.
 */
export function GenresSection({ artId, genres }: GenresSectionProps) {
    const [open, setOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(
        () => new Set(genres.map((genre) => genre.id))
    );

    const {
        genres: catalog,
        isLoading: catalogLoading,
        error: catalogError,
    } = useGenres();
    const { isSaving, save } = useUpdateArtworkGenres(artId);

    function handleOpenChange(nextOpen: boolean) {
        if (nextOpen) {
            setSelectedIds(new Set(genres.map((genre) => genre.id)));
        }
        setOpen(nextOpen);
    }

    function toggle(id: number) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                // Keep at least one genre selected.
                if (next.size === 1) return prev;
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }

    async function handleSave() {
        const ok = await save(Array.from(selectedIds));
        if (ok) {
            setOpen(false);
        }
    }

    return (
        <>
            <Card className="overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b px-5 py-3.5">
                    <div className="flex items-center gap-2">
                        <span className="bg-primary/10 text-primary inline-flex h-8 w-8 items-center justify-center rounded-lg">
                            <Tags className="h-4 w-4" />
                        </span>
                        <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                            Genres
                        </span>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setOpen(true)}
                        className="shrink-0"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit genres
                    </Button>
                </div>

                <CardContent className="p-5 sm:p-6">
                    {genres.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            No genres assigned yet.
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {genres.map((genre) => (
                                <Badge key={genre.id} variant="secondary">
                                    {genre.name}
                                </Badge>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="rounded-3xl sm:max-w-xl">
                    <DialogHeader>
                        <div className="mb-2 flex items-center gap-2">
                            <span className="bg-primary/10 text-primary inline-flex h-9 w-9 items-center justify-center rounded-xl">
                                <Tags className="h-4 w-4" />
                            </span>
                        </div>
                        <DialogTitle>Edit genre tags</DialogTitle>
                        <DialogDescription>
                            Select one or more genres that describe this artwork.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-[60vh] overflow-y-auto rounded-2xl border bg-muted/10 p-4">
                        {catalogLoading ? (
                            <div className="text-muted-foreground flex items-center justify-center py-8">
                                <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                        ) : catalogError ? (
                            <p className="text-sm text-red-600">{catalogError}</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {catalog.map((genre) => {
                                    const isSelected = selectedIds.has(genre.id);
                                    return (
                                        <button
                                            key={genre.id}
                                            type="button"
                                            onClick={() => toggle(genre.id)}
                                            aria-pressed={isSelected}
                                            className={cn(
                                                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-base font-medium transition-all",
                                                "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                                                isSelected
                                                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                                    : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted/50"
                                            )}
                                        >
                                            {genre.name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <p className="text-muted-foreground text-sm">
                        {selectedIds.size === 0
                            ? "Select at least one genre to continue."
                            : `${selectedIds.size} genre${selectedIds.size === 1 ? "" : "s"} selected.`}
                    </p>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving || selectedIds.size === 0}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save changes"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
