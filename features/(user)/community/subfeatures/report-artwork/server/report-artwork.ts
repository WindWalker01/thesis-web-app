"use server";

import { reportArtworkSchema, type ReportArtworkInput } from "../schemas/report-artwork-schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("You must be logged in to submit a report.");
    }

    const input = parsed.data;

    const payload = {
        reporter_id: user.id,
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