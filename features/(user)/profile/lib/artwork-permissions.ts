export const EDITABLE_ARTWORK_STATUSES = [
    "flagged",
    "under_review",
    "pending_blockchain",
] as const;

export const DELETABLE_ARTWORK_STATUSES = [
    "flagged",
    "under_review",
    "pending_blockchain",
] as const;

type ArtworkPermissionInput = {
    status: string;
    txHash?: string | null;
    workId?: string | null;
    blockNumber?: number | null;
    chain?: string | null;
};

export function hasBlockchainRecord({
    txHash,
    workId,
    blockNumber,
    chain,
}: Omit<ArtworkPermissionInput, "status">) {
    return Boolean(
        (typeof txHash === "string" && txHash.trim()) ||
        (typeof workId === "string" && workId.trim()) ||
        typeof blockNumber === "number" ||
        (typeof chain === "string" && chain.trim())
    );
}

export function canEditArtwork(input: ArtworkPermissionInput) {
    if (hasBlockchainRecord(input)) return false;

    return EDITABLE_ARTWORK_STATUSES.includes(
        input.status as (typeof EDITABLE_ARTWORK_STATUSES)[number]
    );
}

export function canDeleteArtwork(input: ArtworkPermissionInput) {
    if (hasBlockchainRecord(input)) return false;

    return DELETABLE_ARTWORK_STATUSES.includes(
        input.status as (typeof DELETABLE_ARTWORK_STATUSES)[number]
    );
}