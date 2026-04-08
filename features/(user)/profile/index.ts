import { OwnershipStatus, HashStatus } from "./types";

export function mapOwnershipStatus(
    status: string,
    txHash: string | null
): OwnershipStatus {
    if (status === "registered" || status === "protected" || txHash) {
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