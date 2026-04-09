import type { ArtworkStatus, IssueReport } from "../../types";

export function getIssueExplanation({
    status,
    similarityPercentage,
    totalMatches,
    latestReport,
    hasTxHash,
}: {
    status: ArtworkStatus;
    similarityPercentage: number | null;
    totalMatches: number;
    latestReport: IssueReport | null;
    hasTxHash: boolean;
}) {
    if (status === "flagged") {
        if (similarityPercentage !== null) {
            return `This artwork was flagged for review because the stored similarity scan detected a notable similarity result of ${Number(
                similarityPercentage
            ).toFixed(
                2
            )}% and found ${totalMatches} potential match${totalMatches === 1 ? "" : "es"}. This should be treated as a review signal, not as automatic proof of infringement.`;
        }

        return "This artwork was flagged for review because the system recorded an issue-state artwork with a saved similarity scan or review signal. It should be inspected manually before any final moderation conclusion.";
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