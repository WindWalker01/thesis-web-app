import * as z from "zod";

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const ACCEPTED_TYPES = [
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

export const ACCEPT_ATTR = ".png,.jpg,.jpeg,.webp,.avif,.gif,.bmp,.tiff,.svg";

/**
 * Human-readable format labels derived from {@link ACCEPTED_TYPES}, used for the
 * dropzone badges and the supported-formats alert. Deriving them here keeps a
 * single source of truth instead of hardcoding the list in multiple components.
 */
export const SUPPORTED_FORMAT_LABELS = Array.from(
  new Set(
    ACCEPTED_TYPES.map((mime) => {
      const subtype = mime.split("/")[1]?.replace("+xml", "") ?? mime;
      return subtype.toUpperCase();
    }),
  ),
);

/** Formats recommended for best similarity-detection accuracy. */
export const RECOMMENDED_FORMAT_LABELS = ["PNG", "JPG", "JPEG"] as const;

/** Maximum accepted upload size expressed in megabytes for display. */
export const MAX_FILE_SIZE_MB = MAX_FILE_SIZE / 1024 / 1024;

export const formSchema = z.object({
    title: z
        .string()
        .trim()
        .min(3, "Artwork title must be at least 3 characters.")
        .max(120, "Artwork title must be 120 characters or less."),
    description: z
        .string()
        .max(1000, "Description must be 1000 characters or less.")
        .optional()
        .or(z.literal("")),
    file: z
        .instanceof(File, { message: "Please upload an artwork file." })
        .refine((file) => file.size <= MAX_FILE_SIZE, "File must be 5MB or smaller.")
        .refine(
            (file) => ACCEPTED_TYPES.includes(file.type as (typeof ACCEPTED_TYPES)[number]),
            "Unsupported format. Please upload a PNG, JPG, WEBP, AVIF, GIF, BMP, TIFF, or SVG file."
        ),
    rightsConfirmed: z.boolean().refine((value) => value === true, {
        message: "You must confirm ownership or authorization.",
    }),
});

export type UploadArtworkFormValues = z.infer<typeof formSchema>;