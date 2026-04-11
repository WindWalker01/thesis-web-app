import { z } from "zod";

export const editArtworkSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, "Title is required.")
        .max(150, "Title must be 150 characters or less."),
    description: z
        .string()
        .max(1000, "Description must be 1000 characters or less.")
        .optional()
        .or(z.literal("")),
});

export type EditArtworkFormValues = z.infer<typeof editArtworkSchema>;