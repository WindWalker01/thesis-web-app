// ============================================
// Reporting & Complaint Management - Service Layer
// Business logic, status workflow validation, audit logging, notifications
// ============================================

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Report,
  ReportStatus,
  ReportActionType,
  ReportAction,
  ReportComment,
  ReportEvidence,
  ReportDecision,
} from "@/features/reports/types";
import { VALID_STATUS_TRANSITIONS } from "@/features/reports/types";
import * as repo from "./reports-repository";

// ========== STATUS WORKFLOW VALIDATION ==========

export function isValidStatusTransition(
  from: ReportStatus,
  to: ReportStatus
): boolean {
  const allowed = VALID_STATUS_TRANSITIONS[from];
  return allowed.includes(to);
}

export function getValidNextStatuses(
  currentStatus: ReportStatus
): ReportStatus[] {
  return VALID_STATUS_TRANSITIONS[currentStatus];
}

function isTerminalStatus(status: ReportStatus): boolean {
  return ["resolved"].includes(status);
}

// ========== AUDIT LOGGING ==========

export async function createAuditRecord(
  supabase: SupabaseClient,
  data: {
    report_id: string;
    admin_id: string;
    action: ReportActionType;
    previous_status: ReportStatus | null;
    new_status: ReportStatus | null;
    notes: string | null;
  }
): Promise<ReportAction> {
  return repo.insertReportAction(supabase, data);
}

// ========== NOTIFICATION CREATION ==========

export async function createReportNotification(
  supabase: SupabaseClient,
  data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    reportId: string;
  }
): Promise<void> {
  const { error } = await supabase.from("notifications").insert({
    user_id: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    related_report_id: data.reportId,
      action_url: `/my-reports/${data.reportId}`,
    metadata: {},
    is_read: false,
  });

  if (error) {
    console.error("Failed to create notification:", error.message);
  }
}

export async function createAdminNotification(
  supabase: SupabaseClient,
  data: {
    type: string;
    title: string;
    message: string;
    reportId: string;
  }
): Promise<void> {
  // Notify all admin users
  const { data: admins, error } = await supabase
    .from("users")
    .select("id")
    .eq("role", "admin");

  if (error || !admins) return;

  const notifications = admins.map((admin) => ({
    user_id: admin.id,
    type: data.type,
    title: data.title,
    message: data.message,
    related_report_id: data.reportId,
    action_url: `/admin/reports/${data.reportId}`,
    metadata: {},
    is_read: false,
  }));

  if (notifications.length > 0) {
    const { error: insertError } = await supabase
      .from("notifications")
      .insert(notifications);

    if (insertError) {
      console.error("Failed to create admin notifications:", insertError.message);
    }
  }
}

// ========== UPDATE STATUS WITH VALIDATION & AUDIT ==========

export async function updateReportStatusWithAudit(
  supabase: SupabaseClient,
  data: {
    reportId: string;
    newStatus: ReportStatus;
    adminId: string;
    notes?: string;
  }
): Promise<{ report: Report; action: ReportAction }> {
  // Get current report
  const report = await repo.getReportById(supabase, data.reportId);
  if (!report) {
    throw new Error("Report not found");
  }

  // Validate transition
  const currentStatus = report.status;
  if (currentStatus === data.newStatus) {
    throw new Error("Report is already in this status");
  }

  if (!isValidStatusTransition(currentStatus, data.newStatus)) {
    throw new Error(
      `Cannot transition from "${currentStatus}" to "${data.newStatus}". Valid transitions: ${getValidNextStatuses(currentStatus).join(", ")}`
    );
  }

  // Determine if resolved_at should be set
  const isResolution = data.newStatus === "resolved";
  const resolvedAt = isResolution ? new Date().toISOString() : null;

  // Update status
  await repo.updateReportStatus(
    supabase,
    data.reportId,
    data.newStatus,
    resolvedAt
  );

  // Create audit record
  const action = await createAuditRecord(supabase, {
    report_id: data.reportId,
    admin_id: data.adminId,
    action: "status_change",
    previous_status: currentStatus,
    new_status: data.newStatus,
    notes: data.notes ?? null,
  });

  // Get updated report
  const updatedReport = (await repo.getReportById(
    supabase,
    data.reportId
  )) as Report;

  // Notify reporter of status change
  await createReportNotification(supabase, {
    userId: updatedReport.reporter_id,
    type: "report_resolved",
    title: "Report Status Updated",
    message: `Your report "${updatedReport.title}" has been updated to "${data.newStatus.replace(/_/g, " ")}".`,
    reportId: data.reportId,
  });

  return { report: updatedReport, action };
}

// ========== ADD COMMENT (with audit if admin) ==========

export async function addCommentWithAudit(
  supabase: SupabaseClient,
  data: {
    reportId: string;
    userId: string;
    message: string;
    isAdmin: boolean;
  }
): Promise<ReportComment> {
  // Verify report exists
  const report = await repo.getReportById(supabase, data.reportId);
  if (!report) {
    throw new Error("Report not found");
  }

  // Check terminal status - no comments on resolved/rejected/closed reports
  if (isTerminalStatus(report.status) && !data.isAdmin) {
    throw new Error("Cannot comment on a report with a final status");
  }

  // Add comment
  const comment = await repo.insertReportComment(supabase, {
    report_id: data.reportId,
    user_id: data.userId,
    message: data.message,
    is_admin: data.isAdmin,
  });

  // If admin, create audit record
  if (data.isAdmin) {
    await createAuditRecord(supabase, {
      report_id: data.reportId,
      admin_id: data.userId,
      action: "comment_added",
      previous_status: null,
      new_status: null,
      notes: data.message.substring(0, 200),
    });

    // Notify reporter
    await createReportNotification(supabase, {
      userId: report.reporter_id,
      type: "report_submitted",
      title: "New Response on Your Report",
      message: "An admin has responded to your report.",
      reportId: data.reportId,
    });
  } else {
    // Notify admins
    await createAdminNotification(supabase, {
      type: "report_submitted",
      title: "New Comment on Report",
      message: `The reporter added a comment to report "${report.title}".`,
      reportId: data.reportId,
    });
  }

  return comment;
}

// ========== REQUEST EVIDENCE ==========

export async function requestEvidenceWithAudit(
  supabase: SupabaseClient,
  data: {
    reportId: string;
    adminId: string;
    message: string;
  }
): Promise<{ comment: ReportComment; action: ReportAction; report: Report }> {
  // Verify report exists
  const report = await repo.getReportById(supabase, data.reportId);
  if (!report) {
    throw new Error("Report not found");
  }

  if (isTerminalStatus(report.status)) {
    throw new Error("Cannot request evidence on a report with a final status");
  }

  // Only allow evidence requests on reports that are under review
  if (report.status !== "under_review") {
    throw new Error(
      `Cannot request evidence on a report with status "${report.status}". The report must be under review.`
    );
  }

  // Add admin comment
  const comment = await repo.insertReportComment(supabase, {
    report_id: data.reportId,
    user_id: data.adminId,
    message: data.message,
    is_admin: true,
  });

  // Create audit record for evidence request (no status change)
  const action = await createAuditRecord(supabase, {
    report_id: data.reportId,
    admin_id: data.adminId,
    action: "evidence_requested",
    previous_status: report.status,
    new_status: report.status,
    notes: data.message.substring(0, 200),
  });

  // Notify reporter with detailed message
  await createReportNotification(supabase, {
    userId: report.reporter_id,
    type: "report_awaiting_evidence",
    title: "Additional Evidence Required",
    message: `An administrator has reviewed your report "${report.title}" and requires additional evidence before making a decision. Please visit your report to upload the requested information.\n\nAdmin note: ${data.message}`,
    reportId: data.reportId,
  });

  return { comment, action, report };
}

// ========== EVIDENCE UPLOAD ==========

export async function uploadEvidence(
  supabase: SupabaseClient,
  data: {
    reportId: string;
    userId: string;
    fileName: string;
    mimeType: string | null;
    description: string | null;
    fileBuffer: ArrayBuffer;
  }
): Promise<ReportEvidence> {
  // Verify report exists and belongs to user or user is admin
  const report = await repo.getReportById(supabase, data.reportId);
  if (!report) {
    throw new Error("Report not found");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = user?.id
    ? (
        await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single()
      ).data?.role === "admin"
    : false;

  if (report.reporter_id !== data.userId && !isAdmin) {
    throw new Error("Not authorized to upload evidence to this report");
  }

  if (isTerminalStatus(report.status)) {
    throw new Error("Cannot upload evidence to a report with a final status");
  }

  // Upload file to Supabase Storage
  const storagePath = `reports/${data.reportId}/${Date.now()}_${data.fileName}`;

  const adminClient = createSupabaseAdminClient();
  const { error: uploadError } = await adminClient.storage
    .from("report-evidence")
    .upload(storagePath, new Blob([data.fileBuffer]), {
      contentType: data.mimeType ?? undefined,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  // Get public URL
  const { data: urlData } = adminClient.storage
    .from("report-evidence")
    .getPublicUrl(storagePath);

  const fileUrl = urlData.publicUrl;

  // Insert evidence record
  const evidence = await repo.insertReportEvidence(supabase, {
    report_id: data.reportId,
    uploaded_by: data.userId,
    file_url: fileUrl,
    file_name: data.fileName,
    mime_type: data.mimeType,
    description: data.description ?? null,
  });

  // If reporter uploaded, notify admins
  if (!isAdmin) {
    // Create audit record
    await createAuditRecord(supabase, {
      report_id: data.reportId,
      admin_id: data.userId,
      action: "evidence_uploaded",
      previous_status: null,
      new_status: null,
      notes: `Uploaded: ${data.fileName}`,
    });


    await createAdminNotification(supabase, {
      type: "report_submitted",
      title: "New Evidence Uploaded",
      message: `The reporter uploaded evidence to report "${report.title}".`,
      reportId: data.reportId,
    });
  }

  return evidence;
}

// ========== VERIFY USER IS ADMIN ==========

export async function isAdminUser(userId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  return profile?.role === "admin";
}

// ========== ASSIGN ADMIN ==========

export async function assignAdminToReport(
  supabase: SupabaseClient,
  data: {
    reportId: string;
    adminId: string;
    currentUserId: string;
  }
): Promise<{ report: Report; action: ReportAction }> {
  // Verify report exists
  const report = await repo.getReportById(supabase, data.reportId);
  if (!report) {
    throw new Error("Report not found");
  }

  if (report.status === "resolved") {
    throw new Error("Cannot assign admin to a resolved report");
  }

  const previousStatus = report.status;

  // Assign admin and update status
  await repo.assignAdminToReport(supabase, data.reportId, data.adminId);

  // Get the assigned admin's name for the audit log
  const assignedAdmin = await repo.getReportAssignedAdmin(supabase, data.reportId);
  const adminName = assignedAdmin
    ? `${assignedAdmin.first_name} ${assignedAdmin.last_name} (@${assignedAdmin.username})`
    : data.adminId;

  // Create audit record
  const action = await createAuditRecord(supabase, {
    report_id: data.reportId,
    admin_id: data.currentUserId,
    action: "status_change",
    previous_status: previousStatus,
    new_status: "under_review",
    notes: `Assigned to admin: ${adminName}`,
  });

  // Notify reporter
  await createReportNotification(supabase, {
    userId: report.reporter_id,
    type: "report_resolved",
    title: "Report Under Review",
    message: `Your report "${report.title}" has been assigned to an administrator for investigation.`,
    reportId: data.reportId,
  });

  const updatedReport = (await repo.getReportById(supabase, data.reportId)) as Report;

  return { report: updatedReport, action };
}

// ========== APPROVE REPORT (resolve with no_violation) ==========

export async function approveReport(
  supabase: SupabaseClient,
  data: {
    reportId: string;
    adminId: string;
    summary: string;
  }
): Promise<{ report: Report; action: ReportAction; decision: ReportDecision }> {
  // Verify report exists
  const report = await repo.getReportById(supabase, data.reportId);
  if (!report) {
    throw new Error("Report not found");
  }

  if (report.status === "resolved") {
    throw new Error("Report is already resolved");
  }

  // Record decision
  const decision = await repo.insertReportDecision(supabase, {
    report_id: data.reportId,
    admin_id: data.adminId,
    decision: "no_violation",
    summary: data.summary,
  });

  // Update report status
  const resolvedAt = new Date().toISOString();
  await repo.updateReportStatus(supabase, data.reportId, "resolved", resolvedAt);

  // Create audit record
  const action = await createAuditRecord(supabase, {
    report_id: data.reportId,
    admin_id: data.adminId,
    action: "decision_recorded",
    previous_status: report.status,
    new_status: "resolved",
    notes: `Report approved. Decision: no_violation. Summary: ${data.summary.substring(0, 200)}`,
  });

  const updatedReport = (await repo.getReportById(supabase, data.reportId)) as Report;

  // Notify reporter
  await createReportNotification(supabase, {
    userId: updatedReport.reporter_id,
    type: "report_resolved",
    title: "Report Resolved",
    message: `Your report "${updatedReport.title}" has been reviewed. No violation was found.`,
    reportId: data.reportId,
  });

  return { report: updatedReport, action, decision };
}

// ========== REJECT REPORT (resolve with reason) ==========

export async function rejectReport(
  supabase: SupabaseClient,
  data: {
    reportId: string;
    adminId: string;
    reason: string;
    summary: string;
  }
): Promise<{ report: Report; action: ReportAction; decision: ReportDecision }> {
  // Verify report exists
  const report = await repo.getReportById(supabase, data.reportId);
  if (!report) {
    throw new Error("Report not found");
  }

  if (report.status === "resolved") {
    throw new Error("Report is already resolved");
  }

  // Map frontend reason to decision value
  const decisionValue = data.reason === "false_report"
    ? "no_violation"
    : data.reason === "duplicate"
      ? "false_report"
      : data.reason === "insufficient_evidence"
        ? "insufficient_evidence"
        : "guideline_violation";

  // Record decision
  const decision = await repo.insertReportDecision(supabase, {
    report_id: data.reportId,
    admin_id: data.adminId,
    decision: decisionValue,
    summary: `[${data.reason.replace(/_/g, " ")}] ${data.summary}`,
  });

  // Update report status
  const resolvedAt = new Date().toISOString();
  await repo.updateReportStatus(supabase, data.reportId, "resolved", resolvedAt);

  // Create audit record
  const action = await createAuditRecord(supabase, {
    report_id: data.reportId,
    admin_id: data.adminId,
    action: "decision_recorded",
    previous_status: report.status,
    new_status: "resolved",
    notes: `Report rejected. Reason: ${data.reason}. Summary: ${data.summary.substring(0, 200)}`,
  });

  const updatedReport = (await repo.getReportById(supabase, data.reportId)) as Report;

  // Notify reporter
  const reasonLabels: Record<string, string> = {
    false_report: "determined to be a false report",
    duplicate: "identified as a duplicate",
    insufficient_evidence: "found to have insufficient evidence",
    other: "closed after review",
  };

  await createReportNotification(supabase, {
    userId: updatedReport.reporter_id,
    type: "report_resolved",
    title: "Report Resolved",
    message: `Your report "${updatedReport.title}" has been reviewed and ${reasonLabels[data.reason] ?? "resolved"}.`,
    reportId: data.reportId,
  });

  return { report: updatedReport, action, decision };
}

// ========== CLOSE REPORT ==========

export async function closeReport(
  supabase: SupabaseClient,
  data: {
    reportId: string;
    adminId: string;
    notes?: string;
  }
): Promise<{ report: Report; action: ReportAction }> {
  // Verify report exists
  const report = await repo.getReportById(supabase, data.reportId);
  if (!report) {
    throw new Error("Report not found");
  }

  if (report.status === "resolved") {
    throw new Error("Report is already resolved");
  }

  const previousStatus = report.status;

  // Update report status
  const resolvedAt = new Date().toISOString();
  await repo.updateReportStatus(supabase, data.reportId, "resolved", resolvedAt);

  // Create audit record
  const action = await createAuditRecord(supabase, {
    report_id: data.reportId,
    admin_id: data.adminId,
    action: "status_change",
    previous_status: previousStatus,
    new_status: "resolved",
    notes: data.notes ?? "Report closed by administrator",
  });

  const updatedReport = (await repo.getReportById(supabase, data.reportId)) as Report;

  // Notify reporter
  await createReportNotification(supabase, {
    userId: updatedReport.reporter_id,
    type: "report_resolved",
    title: "Report Closed",
    message: `Your report "${updatedReport.title}" has been closed by an administrator.`,
    reportId: data.reportId,
  });

  return { report: updatedReport, action };
}

// ========== VERIFY REPORT OWNERSHIP ==========

export async function verifyReportOwnership(
  supabase: SupabaseClient,
  reportId: string,
  userId: string
): Promise<boolean> {
  const report = await repo.getReportById(supabase, reportId);
  return report?.reporter_id === userId;
}

// ========== UNIFIED RESOLVE REPORT ==========

export async function resolveReport(
  supabase: SupabaseClient,
  data: {
    reportId: string;
    adminId: string;
    decision: "no_violation" | "guideline_violation" | "copyright_confirmed" | "insufficient_evidence" | "false_report";
    summary: string;
  }
): Promise<{ report: Report; action: ReportAction; decision: ReportDecision }> {
  const report = await repo.getReportById(supabase, data.reportId);
  if (!report) throw new Error("Report not found");
  if (report.status === "resolved") throw new Error("Report is already resolved");

  const previousStatus = report.status;

  // Record decision
  const decision = await repo.insertReportDecision(supabase, {
    report_id: data.reportId,
    admin_id: data.adminId,
    decision: data.decision,
    summary: data.summary,
  });

  // Update report status
  const resolvedAt = new Date().toISOString();
  await repo.updateReportStatus(supabase, data.reportId, "resolved", resolvedAt);

  // Create audit record
  const action = await createAuditRecord(supabase, {
    report_id: data.reportId,
    admin_id: data.adminId,
    action: "decision_recorded",
    previous_status: previousStatus,
    new_status: "resolved",
    notes: `Report resolved. Decision: ${data.decision}. Summary: ${data.summary.substring(0, 200)}`,
  });

  const updatedReport = (await repo.getReportById(supabase, data.reportId)) as Report;

  // Notify reporter
  const decisionMessage = {
    no_violation: "no violation was found",
    guideline_violation: "a community guideline violation was confirmed",
    copyright_confirmed: "a copyright violation was confirmed",
    insufficient_evidence: "there was insufficient evidence",
    false_report: "it was determined to be a false report",
  }[data.decision];

  await createReportNotification(supabase, {
    userId: updatedReport.reporter_id,
    type: "report_resolved",
    title: "Report Resolved",
    message: `Your report "${updatedReport.title}" has been reviewed — ${decisionMessage}.`,
    reportId: data.reportId,
  });

  return { report: updatedReport, action, decision };
}

// ========== RECEIVE EVIDENCE & REOPEN ==========

/**
 * Called when evidence is uploaded.
 * Notifies admins that new evidence has been submitted.
 */
export async function receiveEvidenceAndReopen(
  supabase: SupabaseClient,
  data: {
    reportId: string;
    uploaderId: string;
    fileName: string;
  }
): Promise<{ report: Report; action: ReportAction }> {
  const report = await repo.getReportById(supabase, data.reportId);
  if (!report) throw new Error("Report not found");

  // Create audit record
  const action = await createAuditRecord(supabase, {
    report_id: data.reportId,
    admin_id: data.uploaderId,
    action: "evidence_uploaded",
    previous_status: report.status,
    new_status: report.status,
    notes: `Evidence uploaded: ${data.fileName}`,
  });

  // Notify admins
  await createAdminNotification(supabase, {
    type: "report_awaiting_evidence",
    title: "New Evidence Submitted",
    message: `New evidence was submitted for report "${report.title}".`,
    reportId: data.reportId,
  });

  return { report, action };
}

// ========== TIMELINE LOGGING HELPER ==========

/**
 * Centralized timeline logging for all moderation actions.
 * Reads the current report status and inserts a report_actions record.
 */
export async function logModerationAction(
  supabase: SupabaseClient,
  data: {
    reportId: string;
    adminId: string;
    action: "user_warned" | "user_suspended" | "user_banned" | "artwork_removed" | "artwork_restored" | "artwork_nsfw" | "plagiarism_scan_rerun";
    notes: string;
  }
): Promise<ReportAction> {
  const report = await repo.getReportById(supabase, data.reportId);
  const currentStatus = report?.status ?? null;

  return createAuditRecord(supabase, {
    report_id: data.reportId,
    admin_id: data.adminId,
    action: data.action,
    previous_status: currentStatus,
    new_status: currentStatus,
    notes: data.notes,
  });
}
