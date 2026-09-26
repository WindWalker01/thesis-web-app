// ============================================
// Live Chat - Zod Schemas
// ============================================

import { z } from "zod";

// ---- Send Message ----
export const sendMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(5000, "Message must be under 5000 characters"),
  message_type: z.enum(["text", "image", "document"]).default("text"),
  file_url: z.string().url().nullable().optional(),
  file_name: z.string().max(255).nullable().optional(),
  mime_type: z.string().max(100).nullable().optional(),
  parent_id: z.string().uuid().nullable().optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

// ---- Mark Messages Read ----
export const markReadSchema = z.object({
  report_id: z.string().uuid(),
});

export type MarkReadInput = z.infer<typeof markReadSchema>;

// ---- Typing Indicator ----
export const typingIndicatorSchema = z.object({
  report_id: z.string().uuid(),
  is_typing: z.boolean(),
});

export type TypingIndicatorInput = z.infer<typeof typingIndicatorSchema>;