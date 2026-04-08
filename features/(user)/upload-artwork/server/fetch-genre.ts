"use server";

import { GenreClassificationResult } from "../types";

/**
 * Requests genre predictions from the classifier service and converts them into
 * the join-table payload expected by art_genres.
 *
 * We keep only meaningful scores, but if the classifier returns nothing strong
 * enough, we still fall back to a small top-N result to avoid empty outputs.
 */
export async function getArtworkGenres(file: File, art_id: string) {
    const genres = await fetchGenreClassification(file);

    if (!genres.success) {
        return [];
    }

    let filtered_genres = genres.results.filter(
        (genre) => genre.score * 100 >= 1,
    );

    if (filtered_genres.length < 1) {
        filtered_genres = genres.results.slice(0, 3);
    }

    return filtered_genres.map((genre) => ({
        art_id,
        genre_id: genre.index,
    }));
}

/**
 * Calls the external genre-classification service with the raw uploaded file.
 *
 * We parse structured error responses when available, but keep a safe fallback
 * message if the remote API returns a non-JSON failure body.
 */
export async function fetchGenreClassification(
    file: File,
): Promise<GenreClassificationResult> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
        `${process.env.DIGITAL_ART_API_URL ?? process.env.NEXT_PUBLIC_DIGITAL_ART_API_URL}/classify/`,
        {
            method: "POST",
            body: formData,
        },
    );

    if (!response.ok) {
        let message = "Failed to classify art genre";

        try {
            const error = await response.json();
            message = error?.detail ?? message;
        } catch {
            // keep fallback message
        }

        throw new Error(message);
    }

    return response.json();
}
