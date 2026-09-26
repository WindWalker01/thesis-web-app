import * as z from "zod";

export const MAX_CLASSIFY_FILE_SIZE = 5 * 1024 * 1024;

export const ACCEPTED_CLASSIFY_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/svg+xml",
] as const;

export const CLASSIFY_ACCEPT_ATTR = ".png,.jpg,.jpeg,.webp,.avif,.gif,.bmp,.tiff,.svg";

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
            "Unsupported format. Please upload a PNG, JPG, WEBP, AVIF, GIF, BMP, TIFF, or SVG file.",
        ),
});

export type ClassificationFormValues = z.infer<typeof classificationSchema>;