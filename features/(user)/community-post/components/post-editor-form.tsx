"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type PostEditorFormProps = {
    mode: "create" | "edit";
    postId?: string;
};

type UserArtwork = {
    id: string;
    title: string;
    imageUrl: string;
    createdAt?: string;
};

/**
 * Temporary mock uploaded artworks.
 * Later, replace this with data fetched from Supabase/backend.
 */
const USER_UPLOADED_ARTWORKS: UserArtwork[] = [
    {
        id: "art-1",
        title: "Starry Night Study",
        imageUrl: "/landing-page-elements/starry-night.png",
        createdAt: "2 days ago",
    },
    {
        id: "art-2",
        title: "Digital Art Sample",
        imageUrl: "/landing-page-elements/digital-art.png",
        createdAt: "5 days ago",
    },
    {
        id: "art-3",
        title: "Photography Entry",
        imageUrl: "/landing-page-elements/photography.png",
        createdAt: "1 week ago",
    },
    {
        id: "art-4",
        title: "Graphic Design Poster",
        imageUrl: "/landing-page-elements/graphic-design.png",
        createdAt: "2 weeks ago",
    },
];

export default function PostEditorForm({
    mode,
    postId,
}: PostEditorFormProps) {
    const isEdit = mode === "edit";

    const initialSelectedArtwork = isEdit ? USER_UPLOADED_ARTWORKS[0] : null;

    const [title, setTitle] = useState(
        isEdit ? "Wala na talagang pag-asa sa Pilipinas." : ""
    );
    const [community, setCommunity] = useState("ArtPH");
    const [description, setDescription] = useState(
        isEdit ? "Existing post description..." : ""
    );
    const [selectedArtworkId, setSelectedArtworkId] = useState<string>(
        initialSelectedArtwork?.id ?? ""
    );

    const selectedArtwork = useMemo(() => {
        return USER_UPLOADED_ARTWORKS.find(
            (artwork) => artwork.id === selectedArtworkId
        );
    }, [selectedArtworkId]);

    const previewReady = useMemo(() => {
        return !!title || !!selectedArtwork;
    }, [title, selectedArtwork]);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!selectedArtworkId) {
            alert("Please select an uploaded artwork first.");
            return;
        }

        const payload = {
            postId,
            title,
            community,
            description,
            artworkId: selectedArtworkId,
            imageUrl: selectedArtwork?.imageUrl,
        };

        console.log(isEdit ? "Updating post..." : "Creating post...", payload);
    }

    return (
        <div className="grid gap-6">
            <form
                onSubmit={handleSubmit}
                className="rounded-3xl border border-[#EDEFF1] dark:border-[#343536] bg-white dark:bg-[#121619] p-5 space-y-5"
            >
                <div className="space-y-2">
                    <label className="text-sm font-medium">Community</label>
                    <Input
                        value={community}
                        onChange={(e) => setCommunity(e.target.value)}
                        placeholder="Enter community name"
                        disabled
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Post title</label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Write a title..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Say something about your artwork..."
                        className="min-h-32"
                    />
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="text-sm font-medium">Select uploaded artwork</label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Choose one of your previously uploaded artworks to use in this post.
                        </p>
                    </div>

                    {USER_UPLOADED_ARTWORKS.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-[#D7DBE0] dark:border-[#343536] p-6 text-sm text-gray-500 dark:text-gray-400">
                            You do not have any uploaded artworks yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {USER_UPLOADED_ARTWORKS.map((artwork) => {
                                const isSelected = selectedArtworkId === artwork.id;

                                return (
                                    <button
                                        key={artwork.id}
                                        type="button"
                                        onClick={() => setSelectedArtworkId(artwork.id)}
                                        className={[
                                            "rounded-2xl overflow-hidden border text-left transition cursor-pointer",
                                            isSelected
                                                ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900"
                                                : "border-[#EDEFF1] dark:border-[#343536] hover:border-slate-400",
                                        ].join(" ")}
                                        aria-pressed={isSelected}
                                    >
                                        <div className="relative w-full h-32 bg-slate-100 dark:bg-slate-800">
                                            <Image
                                                src={artwork.imageUrl}
                                                alt={artwork.title}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 640px) 50vw, 33vw"
                                            />
                                        </div>

                                        <div className="p-3">
                                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
                                                {artwork.title}
                                            </p>
                                            {artwork.createdAt ? (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    Uploaded {artwork.createdAt}
                                                </p>
                                            ) : null}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" disabled={!selectedArtworkId}>
                        {isEdit ? "Save Changes" : "Publish Post"}
                    </Button>

                    <Button type="button" variant="outline">
                        Cancel
                    </Button>
                </div>
            </form>

            <div className="rounded-3xl border border-[#EDEFF1] dark:border-[#343536] bg-white dark:bg-[#121619] p-5">
                <h2 className="text-lg font-semibold mb-4">Preview</h2>

                {!previewReady ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Your post preview will appear here.
                    </p>
                ) : (
                    <article className="w-full max-w-170 mx-auto rounded-3xl px-3 sm:px-4 py-2">
                        <div className="flex items-center gap-2 text-[12px] sm:text-sm text-gray-500 dark:text-gray-300">
                            <div className="w-6 h-6 rounded-full bg-slate-300 shrink-0" />
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                r/{community || "Community"}
                            </span>
                            <span>•</span>
                            <span>Posted by u/you</span>
                        </div>

                        <div className="pt-2 pb-2">
                            <h2 className="text-[15px] sm:text-[16px] font-semibold leading-snug text-gray-900 dark:text-gray-100">
                                {title || "Untitled post"}
                            </h2>
                        </div>

                        {selectedArtwork ? (
                            <div className="w-full overflow-hidden rounded-[14px] border border-[#EDEFF1] dark:border-[#343536]">
                                <div className="relative w-full h-64 sm:h-80 md:h-96">
                                    <Image
                                        src={selectedArtwork.imageUrl}
                                        alt={selectedArtwork.title}
                                        fill
                                        sizes="(max-width: 640px) 100vw, 680px"
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        ) : null}

                        {description ? (
                            <p className="pt-3 text-sm text-gray-600 dark:text-gray-300">
                                {description}
                            </p>
                        ) : null}
                    </article>
                )}
            </div>
        </div>
    );
}