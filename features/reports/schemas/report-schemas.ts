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
  "copyright",
  "spam",
  "harassment",
  "nudity",
  "violence",
  "hate",
  "other",
]);

// ---- Decision Value ----
export const reportDecisionValueSchema = z.enum([
  "no_violation",
  "copyright_confirmed",
  "guideline_violation",
  "insufficient_evidence",
  "false_report",
]);

// ---- Action Type ----
export const reportActionTypeSchema = z.enum([
  "status_change",
  "evidence_requested",
  "evidence_uploaded",
  "comment_added",
  "decision_recorded",
  "report_created",
  "user_warned",
  "user_suspended",
  "user_banned",
  "artwork_removed",
  "artwork_restored",
  "artwork_nsfw",
  "plagiarism_scan_rerun",
  "evidence_reviewed",
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

// ---- Resolve Report (unified) ----
export const resolveReportSchema = z.object({
  decision: z.enum([
    "no_violation",
    "copyright_confirmed",
    "guideline_violation",
    "insufficient_evidence",
    "false_report",
  ]),
  summary: z
    .string()
    .min(10, "Summary must be at least 10 characters")
    .max(3000, "Summary must be at most 3000 characters"),
  artworkActions: z
    .array(z.enum(["keep_artwork", "remove_artwork", "restore_artwork", "mark_nsfw", "rerun_plagiarism"]))
    .optional(),
  artworkReason: z.string().max(2000).optional(),
  userActions: z
    .array(z.enum(["warn_user", "suspend_user", "ban_user"]))
    .optional(),
  userReason: z.string().max(2000).optional(),
});

export type ResolveReportInput = z.infer<typeof resolveReportSchema>;

// ---- Request Evidence ----
export const requestEvidenceSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message must be at most 2000 characters"),
});

export type RequestEvidenceInput = z.infer<typeof requestEvidenceSchema>;

// ---- Assign Admin ----
export const assignAdminSchema = z.object({
  admin_id: z.string().uuid("Invalid admin ID"),
});

export type AssignAdminInput = z.infer<typeof assignAdminSchema>;

// ---- Approve Report (deprecated — kept for backward compat) ----
export const approveReportSchema = z.object({
  summary: z
    .string()
    .min(10, "Summary must be at least 10 characters")
    .max(3000, "Summary must be at most 3000 characters"),
});

export type ApproveReportInput = z.infer<typeof approveReportSchema>;

// ---- Reject Report (deprecated — kept for backward compat) ----
export const rejectReportSchema = z.object({
  reason: z.enum(["false_report", "duplicate", "insufficient_evidence", "other"]),
  summary: z
    .string()
    .min(10, "Summary must be at least 10 characters")
    .max(3000, "Summary must be at most 3000 characters"),
});

export type RejectReportInput = z.infer<typeof rejectReportSchema>;

// ---- Close Report (deprecated — kept for backward compat) ----
export const closeReportSchema = z.object({
  notes: z.string().max(2000, "Notes must be at most 2000 characters").optional(),
});

export type CloseReportInput = z.infer<typeof closeReportSchema>;

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
  "application/octet-stream",
] as const;

// File extensions that map to allowed MIME types (for fallback validation)
const ALLOWED_EXTENSIONS = [
  ".png", ".jpg", ".jpeg", ".webp", ".gif",
  ".pdf",
  ".zip", ".rar",
  ".txt", ".html",
] as const;

/**
 * Validates whether a file's MIME type or extension is allowed.
 * Falls back to extension-based validation when the MIME type is
 * application/octet-stream (common when browsers can't detect the type).
 */
export function isAllowedFileType(mimeType: string, fileName: string): boolean {
  const allowedTypes = ALLOWED_EVIDENCE_MIME_TYPES as readonly string[];
  
  // Direct MIME type match
  if (allowedTypes.includes(mimeType as (typeof ALLOWED_EVIDENCE_MIME_TYPES)[number])) {
    return true;
  }

  // Fallback: if MIME type is octet-stream, check file extension
  if (mimeType === "application/octet-stream") {
    const ext = fileName.toLowerCase().slice(fileName.lastIndexOf("."));
    return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
  }

  return false;
}

export const evidenceFileSchema = z.object({
  size: z.number().max(MAX_EVIDENCE_FILE_SIZE, "File must be under 10MB"),
  type: z.string(),
  name: z.string().min(1).max(255),
}).refine(
  (data) => isAllowedFileType(data.type, data.name),
  { message: "Unsupported file type" }
);

export type EvidenceFileInput = z.infer<typeof evidenceFileSchema>;