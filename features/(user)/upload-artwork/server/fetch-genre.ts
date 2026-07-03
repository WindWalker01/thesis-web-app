"use server";

import { GenreClassificationResult } from "../types";

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
        `${process.env.DIGITAL_ART_API_URL}/classify/`,
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
