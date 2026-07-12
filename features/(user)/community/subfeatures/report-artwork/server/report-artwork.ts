"use server";

import { reportArtworkSchema, type ReportArtworkInput } from "../schemas/report-artwork-schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireActiveAccount } from "@/lib/account-status";

function buildReportTitle(reason: ReportArtworkInput["reason"]) {
    switch (reason) {
        case "copyright":
            return "Copyright / Stolen artwork report";
        case "spam":
            return "Spam or misleading report";
        case "harassment":
            return "Harassment or bullying report";
        case "nudity":
            return "Nudity / sexual content report";
        case "violence":
            return "Violence or gore report";
        case "hate":
            return "Hate or abuse report";
        case "other":
            return "Other report";
        default:
            return "Artwork report";
    }
}

function mapReasonToDbReportType(reason: ReportArtworkInput["reason"]) {
    return reason;
}

function buildReportDescription(input: ReportArtworkInput) {
    const lines: string[] = [`Reason: ${input.reason}`];

    if (input.context?.trim()) {
        lines.push(`Context: ${input.context.trim()}`);
    }

    if (input.details?.trim()) {
        lines.push(`Additional details: ${input.details.trim()}`);
    }

    return lines.join("\n\n");
}

export async function submitArtworkReport(rawInput: ReportArtworkInput) {
    const parsed = reportArtworkSchema.safeParse(rawInput);

    if (!parsed.success) {
        const firstIssue = parsed.error.issues[0];
        throw new Error(firstIssue?.message || "Invalid report submission.");
    }

    const supabase = await createSupabaseServerClient();

    let userId: string;
    try {
        userId = await requireActiveAccount();
    } catch {
        throw new Error("Your account is currently suspended or banned. You cannot submit reports.");
    }

    const input = parsed.data;

    const payload = {
        reporter_id: userId,
        reported_art_post_id: input.postId,
        report_type: mapReasonToDbReportType(input.reason),
        title: buildReportTitle(input.reason),
        description: buildReportDescription(input),
    };

    const { error } = await supabase.from("reports").insert(payload);

    if (error) {
        throw new Error(error.message || "Failed to submit report.");
    }

    return {
        success: true,
        message: "Report submitted successfully.",
    };
}