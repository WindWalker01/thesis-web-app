import type { ArtworkStatus, IssueReport, SimilarityReport } from "../../types";
import { formatSimilarityPercentage } from "../../lib/similarity-report";

export function getIssueExplanation({
    status,
    similarityReport,
    latestReport,
    hasTxHash,
}: {
    status: ArtworkStatus;
    similarityReport: SimilarityReport | null;
    latestReport: IssueReport | null;
    hasTxHash: boolean;
}) {
    const best = similarityReport?.bestMatch ?? null;
    const db = similarityReport?.dbMatch ?? null;
    const web = similarityReport?.webMatch ?? null;

    if (status === "flagged") {
        if (best) {
            const sourceText =
                best.type === "internet"
                    ? `an internet source${best.source ? ` (${best.source})` : ""}`
                    : "a registered artwork in the database";

            let extra = "";

            if (db && web) {
                extra = ` Both internal and external matches were saved, which is why this case needs manual review.`;
            } else if (web) {
                extra = ` The saved scan suggests the strongest signal came from outside the platform.`;
            } else if (db) {
                extra = ` The saved scan suggests the strongest signal came from another registered artwork.`;
            }

            return `This artwork was flagged for review because the saved similarity scan detected its strongest match from ${sourceText} at ${formatSimilarityPercentage(
                best.similarity
            )}.${extra} This should be treated as a review signal, not automatic proof of infringement.`;
        }

        return "This artwork was flagged for review because the system recorded a saved similarity scan or moderation signal that needs manual inspection before any final conclusion.";
    }

    if (status === "removed") {
        if (latestReport) {
            return `This artwork appears as removed. The latest related report is titled “${latestReport.title}”, which suggests the removal likely followed a report review or moderation decision.`;
        }

        return "This artwork appears as removed. A direct reason field is not stored on the artwork row, so the page can only show related reports and saved scan data as context.";
    }

    if (status === "revoked") {
        if (latestReport) {
            return `This artwork appears as revoked. The latest related report is titled “${latestReport.title}”, which may explain why ownership protection or visibility was revoked after review.`;
        }

        return "This artwork appears as revoked. A direct revoke-reason field is not stored on the artwork row, so this page shows the nearest available report and scan context.";
    }

    if (status === "blockchain_failed") {
        return hasTxHash
            ? "This artwork is marked as blockchain failed even though a transaction hash exists. That usually means the protection pipeline recorded a failed state and should be reviewed against the stored chain data."
            : "This artwork is marked as blockchain failed because the blockchain protection step did not complete successfully or did not persist the final on-chain transaction details.";
    }

    return "This artwork is in an issue state and needs manual review.";
}

export function buildChainTxUrl(chain: string, txHash: string) {
    const normalized = chain.trim().toLowerCase();

    if (normalized.includes("polygon amoy") || normalized.includes("amoy")) {
        return `https://amoy.polygonscan.com/tx/${txHash}`;
    }

    if (normalized.includes("polygon")) {
        return `https://polygonscan.com/tx/${txHash}`;
    }

    if (normalized.includes("sepolia")) {
        return `https://sepolia.etherscan.io/tx/${txHash}`;
    }

    if (normalized.includes("ethereum")) {
        return `https://etherscan.io/tx/${txHash}`;
    }

    return `https://amoy.polygonscan.com/tx/${txHash}`;
}

export function formatPercentage(value: number | null): string {
    return value === null ? "N/A" : `${Number(value).toFixed(2)}%`;
}

export function formatIssueMetric(status: ArtworkStatus): string {
    switch (status) {
        case "flagged":
            return "Flagged";
        case "removed":
            return "Removed";
        case "blockchain_failed":
            return "Blockchain Failed";
        case "revoked":
            return "Revoked";
        default:
            return status;
    }
}