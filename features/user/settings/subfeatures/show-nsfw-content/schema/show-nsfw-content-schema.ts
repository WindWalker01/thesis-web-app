import { z } from "zod";

export const showNsfwContentSchema = z.object({
    showNsfwContent: z.boolean(),
});

export type ShowNsfwContentSchema = z.infer<
    typeof showNsfwContentSchema
>;