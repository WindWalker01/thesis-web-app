"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Globe, Lock, ImageIcon, Search, Sparkles, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/client-utils";

import { usePostEditorForm } from "../hooks/usePostEditorForm";
import type { PostEditorInitialData, PostEditorMode } from "../types";

type PostEditorFormProps = {
    mode: PostEditorMode;
    postId?: string;
    initialData: PostEditorInitialData;
};

const visibilityOptions = [
    {
        value: "public",
        label: "Public",
        description: "Visible in the community feed.",
        icon: Globe,
    },
    {
        value: "private",
        label: "Private",
        description: "Only you can view this post.",
        icon: Lock,
    },
] as const;

export default function PostForm({
    mode,
    postId,
    initialData,
}: PostEditorFormProps) {
    const router = useRouter();
    const isEdit = mode === "edit";
    const [search, setSearch] = useState("");

    const {
        form,
        isPending,
        serverMessage,
        selectedArtwork,
        selectableArtworks,
        onSubmit,
    } = usePostEditorForm({
        mode,
        postId,
        initialData,
    });

    const hasArtworks = selectableArtworks.length > 0;

    const filteredArtworks = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return selectableArtworks;

        return selectableArtworks.filter((artwork) => {
            const title = artwork.title.toLowerCase();
            const description = artwork.description?.toLowerCase() ?? "";
            return title.includes(keyword) || description.includes(keyword);
        });
    }, [search, selectableArtworks]);

    return (
        <section className="w-full rounded-3xl border border-border/70 bg-card/90 p-5 shadow-sm backdrop-blur-xl md:p-7">
            <div className="mb-8 flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                    <h2 className="text-lg font-black tracking-tight">
                        {isEdit ? "Edit community post" : "Create community post"}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Select one of your active registered artworks and choose who can view
                        your post.
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={onSubmit} className="space-y-8">
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold">Choose artwork</h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Search your active verified artworks and select one to publish.
                                </p>
                            </div>

                            {!hasArtworks ? (
                                <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
                                    You do not have any eligible active artworks yet.
                                </div>
                            ) : (
                                <>
                                    <div className="relative">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Search artwork title or description..."
                                            className="h-11 rounded-2xl pl-10"
                                            disabled={isPending}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="artId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <div className="rounded-2xl border border-border bg-background">
                                                        <div className="max-h-[440px] overflow-y-auto p-3">
                                                            {filteredArtworks.length === 0 ? (
                                                                <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                                                                    No artworks matched your search.
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-3">
                                                                    {filteredArtworks.map((artwork) => {
                                                                        const isSelected = field.value === artwork.id;

                                                                        return (
                                                                            <button
                                                                                key={artwork.id}
                                                                                type="button"
                                                                                disabled={artwork.disabled || isPending}
                                                                                onClick={() => field.onChange(artwork.id)}
                                                                                className={cn(
                                                                                    "flex w-full items-start gap-4 rounded-2xl border p-3 text-left transition-all",
                                                                                    isSelected
                                                                                        ? "border-primary bg-primary/5 ring-2 ring-primary/10"
                                                                                        : "border-border bg-background hover:border-primary/40 hover:bg-muted/30",
                                                                                    artwork.disabled &&
                                                                                    "cursor-not-allowed opacity-60 hover:border-border hover:bg-background"
                                                                                )}
                                                                            >
                                                                                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                                                                                    {artwork.imageUrl ? (
                                                                                        <Image
                                                                                            src={artwork.imageUrl}
                                                                                            alt={artwork.title}
                                                                                            fill
                                                                                            className="object-cover"
                                                                                            sizes="80px"
                                                                                        />
                                                                                    ) : (
                                                                                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                                                                            <ImageIcon className="h-5 w-5" />
                                                                                        </div>
                                                                                    )}
                                                                                </div>

                                                                                <div className="min-w-0 flex-1">
                                                                                    <div className="flex items-start justify-between gap-3">
                                                                                        <div className="min-w-0">
                                                                                            <p className="line-clamp-1 text-sm font-semibold text-foreground">
                                                                                                {artwork.title}
                                                                                            </p>
                                                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                                                {new Date(artwork.createdAt).toLocaleDateString()}
                                                                                            </p>
                                                                                        </div>

                                                                                        {isSelected ? (
                                                                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                                                                        ) : artwork.alreadyPosted ? (
                                                                                            <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
                                                                                                Already posted
                                                                                            </span>
                                                                                        ) : null}
                                                                                    </div>

                                                                                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                                                                                        {artwork.description || "No description provided."}
                                                                                    </p>
                                                                                </div>
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold">Selected artwork</h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Review the artwork that will be used for this post.
                                </p>
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-border bg-background">
                                <div className="relative aspect-[16/10] w-full bg-muted">
                                    {selectedArtwork?.imageUrl ? (
                                        <Image
                                            src={selectedArtwork.imageUrl}
                                            alt={selectedArtwork.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 1280px) 100vw, 360px"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2 text-center">
                                                <ImageIcon className="h-6 w-6" />
                                                <span className="text-sm">
                                                    {hasArtworks ? "Select an artwork" : "No artwork available"}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 p-4">
                                    <h4 className="line-clamp-2 text-sm font-bold text-foreground">
                                        {selectedArtwork?.title || "Artwork title"}
                                    </h4>

                                    <p className="line-clamp-4 text-xs leading-5 text-muted-foreground">
                                        {selectedArtwork?.description ||
                                            "The selected artwork description will appear here."}
                                    </p>

                                    {selectedArtwork ? (
                                        <div className="pt-2 text-xs text-muted-foreground">
                                            Registered on{" "}
                                            {new Date(selectedArtwork.createdAt).toLocaleDateString()}
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="visibility"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Visibility</FormLabel>
                                        <Select
                                            disabled={isPending}
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-11 rounded-2xl">
                                                    <SelectValue placeholder="Select visibility" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent>
                                                {visibilityOptions.map((option) => {
                                                    const Icon = option.icon;

                                                    return (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            <div className="flex items-center gap-2">
                                                                <Icon className="h-4 w-4" />
                                                                <div className="flex flex-col">
                                                                    <span>{option.label}</span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {option.description}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {serverMessage ? (
                        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                            {serverMessage}
                        </div>
                    ) : null}

                    <div className="flex flex-wrap items-center gap-3 border-t border-border/60 pt-6">
                        <Button type="submit" disabled={!hasArtworks || isPending}>
                            {isPending
                                ? isEdit
                                    ? "Saving changes..."
                                    : "Publishing post..."
                                : isEdit
                                    ? "Save changes"
                                    : "Publish post"}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            disabled={isPending}
                            onClick={() => router.push("/community")}
                        >
                            Cancel
                        </Button>

                        {isPending ? (
                            <p className="text-sm text-muted-foreground">
                                Please wait while we save your post.
                            </p>
                        ) : null}
                    </div>
                </form>
            </Form>
        </section>
    );
}