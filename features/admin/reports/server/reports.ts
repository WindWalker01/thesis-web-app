// ============================================
// Admin Reports - Server Actions
// Re-exports from the shared reports module
// ============================================

export {
  getAdminReportsList,
  getAdminReportDetail,
  getReportStatistics,
} from "@/features/shared/reports/server/reports-repository";

export {
  isAdminUser,
  updateReportStatusWithAudit,
  addCommentWithAudit,
  requestEvidenceWithAudit,
} from "@/features/shared/reports/server/reports-service";
