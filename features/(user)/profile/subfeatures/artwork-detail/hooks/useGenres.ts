"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchGenreCatalog } from "../server/fetch-genre-catalog";
import type { Genre } from "../../../types";

export const genreCatalogKeys = {
    all: () => ["genres"] as const,
};

const GENRE_CATALOG_QUERY_OPTIONS = {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    meta: { persist: false },
} as const;

type UseGenresReturn = {
    genres: Genre[];
    isLoading: boolean;
    error: string | null;
};

export function useGenres(): UseGenresReturn {
    const { data, isLoading, error } = useQuery({
        queryKey: genreCatalogKeys.all(),
        queryFn: async () => {
            const result = await fetchGenreCatalog();

            if (!result.success) {
                throw new Error(result.message);
            }

            return result.genres;
        },
        ...GENRE_CATALOG_QUERY_OPTIONS,
    });

    return {
        genres: data ?? [],
        isLoading,
        error: error instanceof Error ? error.message : null,
    };
}
