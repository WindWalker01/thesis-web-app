"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
    CommunityPageData,
    FeedScope,
    SortOption,
    VisibilityFilter,
} from "../types";

type UseCommunityFeedParams = Pick<
    CommunityPageData,
    "authed" | "currentUserId" | "posts"
>;

const GENRE_ORDER = [
    "Anime",
    "Manga",
    "Cartoon",
    "Semi-Realism",
    "Realism",
    "Hyperrealism",
    "Abstract",
    "Minimalist",
    "Impressionism",
    "Surrealism",
    "Pop Art",
    "Pixel Art",
    "Low Poly",
    "Vector Art",
    "Line Art",
    "Sketch Art",
    "Flat Design",
    "3D Render",
    "Isometric",
] as const;

const GENRE_ORDER_MAP = new Map(
    GENRE_ORDER.map((genre, index) => [genre.toLowerCase(), index])
);

export function useCommunityFeed({
    authed,
    currentUserId,
    posts,
}: UseCommunityFeedParams) {
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");

    const [filtersOpen, setFiltersOpen] = useState(false);
    const [feedScope, setFeedScope] = useState<FeedScope>("community");
    const [visibilityFilter, setVisibilityFilter] =
        useState<VisibilityFilter>("all");
    const [sortBy, setSortBy] = useState<SortOption>("newest");

    const filtersButtonRef = useRef<HTMLButtonElement | null>(null);
    const filtersMenuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (!filtersOpen) return;

            const target = e.target as Node;

            if (filtersButtonRef.current?.contains(target)) return;
            if (filtersMenuRef.current?.contains(target)) return;

            setFiltersOpen(false);
        }

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setFiltersOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [filtersOpen]);

    const availableFilters = useMemo(() => {
        const values = new Set<string>();

        posts.forEach((post) => {
            if (post.category?.trim()) {
                values.add(post.category.trim());
            }
        });

        const sorted = Array.from(values).sort((a, b) => {
            const aIndex = GENRE_ORDER_MAP.get(a.toLowerCase());
            const bIndex = GENRE_ORDER_MAP.get(b.toLowerCase());

            const aKnown = aIndex !== undefined;
            const bKnown = bIndex !== undefined;

            if (aKnown && bKnown) return aIndex - bIndex;
            if (aKnown) return -1;
            if (bKnown) return 1;

            return a.localeCompare(b);
        });

        return ["All", ...sorted];
    }, [posts]);
    
    const filteredPosts = useMemo(() => {
        let result = [...posts];

        if (feedScope === "community") {
            result = result.filter(
                (post) => post.visibility === "public" && !post.isArchived
            );
        }

        if (feedScope === "mine") {
            if (!authed || !currentUserId) {
                result = [];
            } else {
                result = result.filter(
                    (post) => post.userId === currentUserId && !post.isArchived
                );
            }
        }

        if (visibilityFilter !== "all") {
            result = result.filter((post) => post.visibility === visibilityFilter);
        }

        const keyword = search.trim().toLowerCase();
        if (keyword) {
            result = result.filter((post) => {
                return (
                    post.title.toLowerCase().includes(keyword) ||
                    post.username.toLowerCase().includes(keyword) ||
                    post.category?.toLowerCase().includes(keyword) ||
                    post.excerpt?.toLowerCase().includes(keyword) ||
                    post.tags?.some((tag) => tag.toLowerCase().includes(keyword))
                );
            });
        }

        if (activeFilter !== "All") {
            const needle = activeFilter.toLowerCase();

            result = result.filter((post) => {
                return (
                    post.category?.toLowerCase().includes(needle) ||
                    post.tags?.some((tag) => tag.toLowerCase().includes(needle))
                );
            });
        }

        result.sort((a, b) => {
            const aTime = new Date(a.createdAt).getTime();
            const bTime = new Date(b.createdAt).getTime();

            return sortBy === "newest" ? bTime - aTime : aTime - bTime;
        });

        return result;
    }, [
        posts,
        authed,
        currentUserId,
        feedScope,
        visibilityFilter,
        search,
        activeFilter,
        sortBy,
    ]);

    const resetFilters = () => {
        setSearch("");
        setFeedScope("community");
        setVisibilityFilter("all");
        setSortBy("newest");
        setActiveFilter("All");
        setFiltersOpen(false);
    };

    return {
        state: {
            search,
            activeFilter,
            filtersOpen,
            feedScope,
            visibilityFilter,
            sortBy,
            filteredPosts,
            availableFilters,
            filtersButtonRef,
            filtersMenuRef,
        },
        actions: {
            setSearch,
            setActiveFilter,
            setFiltersOpen,
            setFeedScope,
            setVisibilityFilter,
            setSortBy,
            resetFilters,
        },
    };
}