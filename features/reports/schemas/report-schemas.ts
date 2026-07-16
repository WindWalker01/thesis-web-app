// ============================================
// Reporting & Complaint Management - Zod Schemas
// ============================================

import { z } from "zod";

// ---- Report Status ----
export const reportStatusSchema = z.enum([
  "pending_review",
  "under_review",
  "resolved",
]);

// ---- Report Type ----
export const reportTypeSchema = z.enum([
  "plagiarism",
  "repost",
  "tracing",
  "commercial_use",
  "counterfeit",
  "ownership_dispute",
  "other",
]);

// ---- Decision Value ----
export const reportDecisionValueSchema = z.enum([
  "infringement_confirmed",
  "no_violation",
  "insufficient_evidence",
  "duplicate_report",
  "other",
]);

// ---- Action Type ----
export const reportActionTypeSchema = z.enum([
  "status_change",
  "evidence_requested",
  "evidence_uploaded",
  "comment_added",
  "decision_recorded",
  "report_created",
]);

// ---- Create Report ----
export const createReportSchema = z.object({
  reported_art_post_id: z.string().uuid("Invalid artwork post ID"),
  report_type: reportTypeSchema,
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be at most 200 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description must be at most 5000 characters"),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;

// ---- Update Report Status ----
export const updateReportStatusSchema = z.object({
  status: reportStatusSchema,
  notes: z.string().max(2000, "Notes must be at most 2000 characters").optional(),
});

export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>;

// ---- Add Comment ----
export const addCommentSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message must be at most 2000 characters"),
});

export type AddCommentInput = z.infer<typeof addCommentSchema>;

// ---- Add Evidence ----
export const addEvidenceSchema = z.object({
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional(),
});

export type AddEvidenceInput = z.infer<typeof addEvidenceSchema>;

// ---- Record Decision ----
export const recordDecisionSchema = z.object({
  decision: reportDecisionValueSchema,
  summary: z
    .string()
    .min(10, "Summary must be at least 10 characters")
    .max(3000, "Summary must be at most 3000 characters"),
});

export type RecordDecisionInput = z.infer<typeof recordDecisionSchema>;

// ---- Request Evidence ----
export const requestEvidenceSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message must be at most 2000 characters"),
});

export type RequestEvidenceInput = z.infer<typeof requestEvidenceSchema>;

// ---- Admin Reports Query ----
export const adminReportsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: reportStatusSchema.optional(),
  reportType: reportTypeSchema.optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(["created_at", "status", "report_type", "title"]).default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type AdminReportsQueryInput = z.infer<typeof adminReportsQuerySchema>;

// ---- File upload validation ----
export const MAX_EVIDENCE_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_EVIDENCE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/zip",
  "application/x-rar-compressed",
  "text/plain",
  "text/html",
] as const;

export const evidenceFileSchema = z.object({
  size: z.number().max(MAX_EVIDENCE_FILE_SIZE, "File must be under 10MB"),
  type: z.string().refine(
    (val) => (ALLOWED_EVIDENCE_MIME_TYPES as readonly string[]).includes(val),
    { message: "Unsupported file type" }
  ),
  name: z.string().min(1).max(255),
});

export type EvidenceFileInput = z.infer<typeof evidenceFileSchema>;
