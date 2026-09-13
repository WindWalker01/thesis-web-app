import { supabase } from "@/lib/supabase/client";
import { describeAnalysisError } from "@/lib/analysis-errors";
import type { ReportEvidence } from "@/features/reports/types";

type EvidenceUploadTicket = { storagePath: string; token: string };

/**
 * Three-step browser-direct evidence upload:
 *  1. JSON POST → signed Supabase Storage upload ticket (no file bytes).
 *  2. PUT the raw file straight to Supabase Storage, bypassing the Next.js
 *     server (serverless hosts cap function request bodies at ~4.5 MB).
 *  3. JSON PUT → record the evidence metadata.
 */
export async function uploadReportEvidence({
  reportId,
  file,
  description,
}: {
  reportId: string;
  file: File;
  description?: string;
}): Promise<ReportEvidence> {
  try {
    const ticketRes = await fetch(`/api/reports/${reportId}/evidence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        description: description ?? null,
      }),
    });
    const ticketJson = (await ticketRes.json().catch(() => null)) as {
      success?: boolean;
      data?: EvidenceUploadTicket;
      error?: { message?: string };
    } | null;
    const ticket = ticketJson?.data;
    if (!ticketRes.ok || !ticketJson?.success || !ticket?.storagePath || !ticket.token) {
      throw new Error(
        ticketJson?.error?.message ?? "Failed to start the evidence upload.",
      );
    }

    const { error: uploadError } = await supabase.storage
      .from("report-evidence")
      .uploadToSignedUrl(ticket.storagePath, ticket.token, file);
    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    const finalizeRes = await fetch(`/api/reports/${reportId}/evidence`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storagePath: ticket.storagePath,
        fileName: file.name,
        mimeType: file.type,
        description: description ?? null,
      }),
    });
    const finalizeJson = (await finalizeRes.json().catch(() => null)) as {
      success?: boolean;
      data?: ReportEvidence;
      error?: { message?: string };
    } | null;
    if (!finalizeRes.ok || !finalizeJson?.success || !finalizeJson?.data) {
      throw new Error(
        finalizeJson?.error?.message ?? "Failed to save the evidence.",
      );
    }

    return finalizeJson.data;
  } catch (err) {
    throw new Error(describeAnalysisError(err));
  }
}
