"use server";

import {
    classificationSchema,
} from "@/features/classify/schemas/classification-schema";
import type {
    ClassifyArtworkResult,
    ClassificationLabel,
} from "@/features/classify/types";

function normalizePredictions(payload: unknown): ClassificationLabel[] {
    if (!payload || typeof payload !== "object") return [];

    const source = payload as {
        results?: Array<{
            label?: unknown;
            score?: unknown;
            index?: unknown;
        }>;
    };

    if (!Array.isArray(source.results)) return [];

    return source.results
        .map((item) => {
            const label =
                typeof item.label === "string" ? item.label.trim() : "Unknown";
            const score =
                typeof item.score === "number"
                    ? item.score
                    : Number(item.score ?? 0);
            const index =
                typeof item.index === "number"
                    ? item.index
                    : item.index != null
                        ? Number(item.index)
                        : undefined;

            return {
                label,
                score: Number.isFinite(score) ? score : 0,
                index:
                    typeof index === "number" && Number.isFinite(index)
                        ? index
                        : undefined,
            };
        })
        .filter((item) => item.label.length > 0)
        .sort((a, b) => b.score - a.score);
}

export async function classifyArtwork(
    formData: FormData,
): Promise<ClassifyArtworkResult> {
    try {
        const file = formData.get("file");

        const parsed = classificationSchema.safeParse({ file });

        if (!parsed.success) {
            const firstIssue = parsed.error.issues[0];

            return {
                success: false,
                message: firstIssue?.message ?? "Invalid classification request.",
            };
        }

        const requestBody = new FormData();
        requestBody.append("file", parsed.data.file);

        const baseUrl =
            process.env.DIGITAL_ART_API_URL ??
            process.env.NEXT_PUBLIC_DIGITAL_ART_API_URL;

        if (!baseUrl) {
            return {
                success: false,
                message:
                    "Classification service URL is not configured in the environment.",
            };
        }

        const response = await fetch(`${baseUrl}/classify/`, {
            method: "POST",
            body: requestBody,
            cache: "no-store",
        });

        if (!response.ok) {
            let message = "Failed to classify the uploaded image.";

            try {
                const errorPayload = await response.json();
                if (
                    errorPayload &&
                    typeof errorPayload === "object" &&
                    "detail" in errorPayload &&
                    typeof errorPayload.detail === "string"
                ) {
                    message = errorPayload.detail;
                }
            } catch {
                // keep fallback message
            }

            return {
                success: false,
                message,
            };
        }

        const payload = await response.json();
        const predictions = normalizePredictions(payload);

        if (predictions.length === 0) {
            return {
                success: false,
                message: "The classifier returned no usable genre predictions.",
            };
        }

        return {
            success: true,
            message: "Genre classification completed successfully.",
            predictions,
        };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unexpected error while classifying artwork.",
        };
    }
}