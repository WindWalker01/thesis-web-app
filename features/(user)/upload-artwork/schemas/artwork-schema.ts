import * as z from "zod";

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const ACCEPTED_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
] as const;

export const ACCEPT_ATTR = ".png,.jpg,.jpeg";

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
            (file) =>
                ACCEPTED_TYPES.includes(file.type as (typeof ACCEPTED_TYPES)[number]),
            "Unsupported file format."
        ),
    rightsConfirmed: z.boolean().refine((value) => value === true, {
        message: "You must confirm ownership or authorization.",
    }),
});

export type UploadArtworkFormValues = z.infer<typeof formSchema>;