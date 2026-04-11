import * as z from "zod";

export const MAX_CLASSIFY_FILE_SIZE = 5 * 1024 * 1024;

export const ACCEPTED_CLASSIFY_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
] as const;

export const CLASSIFY_ACCEPT_ATTR = ".png,.jpg,.jpeg,";

export const classificationSchema = z.object({
    file: z
        .instanceof(File, { message: "Please upload an image to classify." })
        .refine(
            (file) => file.size <= MAX_CLASSIFY_FILE_SIZE,
            "Image must be 5MB or smaller.",
        )
        .refine(
            (file) =>
                ACCEPTED_CLASSIFY_TYPES.includes(
                    file.type as (typeof ACCEPTED_CLASSIFY_TYPES)[number],
                ),
            "Unsupported image format.",
        ),
});

export type ClassificationFormValues = z.infer<typeof classificationSchema>;