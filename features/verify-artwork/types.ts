export type VerifiableArtworkItem = {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    createdAt: string;
    status: string;
    chain: string | null;
    txHash: string | null;
    blockNumber: number | null;
    workId: string | null;
    fileHash: string;
    perceptualHash: string | null;
    authorIdHash: string | null;
    evidenceHash: string | null;
};

export type VerifyComparisonKey =
    | "work_id"
    | "file_hash"
    | "perceptual_hash"
    | "author_id_hash"
    | "evidence_hash"
    | "revocation_status";

export type VerifyComparisonItem = {
    key: VerifyComparisonKey;
    label: string;
    expected: string | null;
    actual: string | null;
    matches: boolean;
    note?: string | null;
};

export type VerifyArtworkStatus =
    | "verified"
    | "mismatch"
    | "not_recorded"
    | "not_found_on_chain"
    | "revoked"
    | "incomplete"
    | "error";

export type VerifyArtworkResultData = {
    artwork: VerifiableArtworkItem;
    contractAddress: string;
    chainLabel: string;
    explorerBaseUrl: string;
    status: VerifyArtworkStatus;
    summary: string;
    verifiedAt: string;
    onChainWork: {
        workId: string;
        authorIdHash: string;
        attester: string;
        createdAt: string;
        fileHash: string;
        pHash: string;
        evidenceHash: string;
        revoked: boolean;
        revokedAt: string | null;
        revokeReasonHash: string | null;
    } | null;
    comparisons: VerifyComparisonItem[];
};

export type VerifyArtworkSuccessResult = {
    success: true;
    data: VerifyArtworkResultData;
};

export type VerifyArtworkErrorResult = {
    success: false;
    message: string;
};

export type VerifyArtworkResult =
    | VerifyArtworkSuccessResult
    | VerifyArtworkErrorResult;