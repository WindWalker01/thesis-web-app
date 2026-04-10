"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
    CommunityPageData,
    FeedScope,
    SortOption,
    VisibilityFilter,
} from "../types";

/**
 * useCommunityFeed
 * Centralizes community page feed logic:
 * - search
 * - category filter chips
 * - feed scope (community / mine)
 * - visibility filter
 * - sort option
 * - filters dropdown open/close behavior
 *
 * This keeps the page component focused on layout/rendering.
 */
type UseCommunityFeedParams = Pick<
    CommunityPageData,
    "authed" | "currentUserId" | "posts"
>;

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

    /**
     * Close filters dropdown when clicking outside,
     * similar to your useArtPost hook behavior.
     */
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

    /**
     * Build available chip filters dynamically from fetched posts
     * instead of hardcoding Fantasy / Concept Art / etc.
     */
    const availableFilters = useMemo(() => {
        const values = new Set<string>();

        posts.forEach((post) => {
            if (post.category?.trim()) {
                values.add(post.category.trim());
            }

            post.tags?.forEach((tag) => {
                if (tag.trim()) values.add(tag.trim());
            });
        });

        return ["All", ...Array.from(values)];
    }, [posts]);

    /**
     * Main filtered list for the page.
     */
    const filteredPosts = useMemo(() => {
        let result = [...posts];

        // Feed scope
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

        // Visibility filter
        if (visibilityFilter !== "all") {
            result = result.filter((post) => post.visibility === visibilityFilter);
        }

        // Search
        const keyword = search.trim().toLowerCase();
        if (keyword) {
            result = result.filter((post) => {
                return (
                    post.title.toLowerCase().includes(keyword) ||
                    post.username.toLowerCase().includes(keyword) ||
                    post.category?.toLowerCase().includes(keyword) ||
                    post.tags?.some((tag) => tag.toLowerCase().includes(keyword))
                );
            });
        }

        // Category/tag chip filter
        if (activeFilter !== "All") {
            const needle = activeFilter.toLowerCase();

            result = result.filter((post) => {
                return (
                    post.category?.toLowerCase().includes(needle) ||
                    post.tags?.some((tag) => tag.toLowerCase().includes(needle))
                );
            });
        }

        // Sort
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

    /**
     * Reset only feed-related filters.
     */
    const resetFilters = () => {
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