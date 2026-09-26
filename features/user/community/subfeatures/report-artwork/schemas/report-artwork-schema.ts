import { z } from "zod";

export const reportReasonValues = [
    "copyright",
    "spam",
    "harassment",
    "nudity",
    "violence",
    "hate",
    "other",
] as const;

export const reportReasonSchema = z.enum(reportReasonValues);

export const reportArtworkSchema = z
    .object({
        postId: z.string().uuid("Invalid post id."),
        reason: reportReasonSchema,
        details: z
            .string()
            .trim()
            .max(1000, "Additional details must be at most 1000 characters.")
            .optional()
            .or(z.literal("")),
        context: z
            .string()
            .trim()
            .max(2000, "Context must be at most 2000 characters.")
            .optional()
            .or(z.literal("")),
    })
    .superRefine((data, ctx) => {
        const needsContext =
            data.reason === "copyright" || data.reason === "other";

        if (needsContext && !data.context?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["context"],
                message:
                    data.reason === "copyright"
                        ? "Please provide the original source / link or explain why you believe it’s stolen."
                        : "Please describe the issue.",
            });
        }
    });

export type ReportArtworkInput = z.infer<typeof reportArtworkSchema>;
export type ReportReason = z.infer<typeof reportReasonSchema>;

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
    { value: "copyright", label: "Copyright / Stolen artwork" },
    { value: "spam", label: "Spam or misleading" },
    { value: "harassment", label: "Harassment or bullying" },
    { value: "nudity", label: "Nudity / sexual content" },
    { value: "violence", label: "Violence or gore" },
    { value: "hate", label: "Hate or abuse" },
    { value: "other", label: "Other" },
];