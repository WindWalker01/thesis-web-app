import { OwnershipStatus, HashStatus, ArtworkStatus, ProfileScope } from "./types";

export const GALLERY_ARTWORK_STATUSES: ArtworkStatus[] = [
    "active",
    "under_review",
    "pending_blockchain",
];

export const ISSUE_ARTWORK_STATUSES: ArtworkStatus[] = [
    "flagged",
    "removed",
    "blockchain_failed",
    "revoked",
];

export function getStatusesForScope(scope: ProfileScope): ArtworkStatus[] {
    return scope === "issues" ? ISSUE_ARTWORK_STATUSES : GALLERY_ARTWORK_STATUSES;
}

export function mapOwnershipStatus(
    status: string,
    txHash: string | null
): OwnershipStatus {
    if (status === "active" && txHash) {
        return "verified";
    }

    return "pending";
}

export function mapHashStatus(perceptualHash: string | null): HashStatus {
    return perceptualHash ? "complete" : "processing";
}

export function formatUploadDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function assertNever(value: never): never {
    throw new Error(`Unhandled artwork status: ${value}`);
}

export function formatArtworkStatusLabel(status: ArtworkStatus): string {
    switch (status) {
        case "active":
            return "Active";
        case "under_review":
            return "Under Review";
        case "pending_blockchain":
            return "Pending Blockchain";
        case "flagged":
            return "Flagged";
        case "removed":
            return "Removed";
        case "blockchain_failed":
            return "Blockchain Failed";
        case "revoked":
            return "Revoked";
        default:
            return assertNever(status);
    }
}