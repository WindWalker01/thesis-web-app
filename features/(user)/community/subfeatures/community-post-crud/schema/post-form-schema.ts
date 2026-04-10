import { z } from "zod";

export const postVisibilitySchema = z.enum(["public", "private"]);

export const postFormSchema = z.object({
  artId: z.string().uuid("Please select an artwork."),
  visibility: postVisibilitySchema,
});

export type PostFormValues = z.infer<typeof postFormSchema>;