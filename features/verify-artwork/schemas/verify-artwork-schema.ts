import { z } from "zod";

export const verifyArtworkSchema = z.object({
    artworkId: z.string().uuid("Please select a valid artwork."),
});

export type VerifyArtworkInput = z.infer<typeof verifyArtworkSchema>;