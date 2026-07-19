// ============================================
// Admin Reports - Server Actions
// Re-exports from the shared reports module
// ============================================

export {
  getAdminReportsList,
  getAdminReportDetail,
  getReportStatistics,
} from "@/features/reports/server/reports-repository";

export {
  isAdminUser,
  updateReportStatusWithAudit,
  addCommentWithAudit,
  requestEvidenceWithAudit,
} from "@/features/reports/server/reports-service";
