export type CertificateVerificationStatus = "Valid" | "Pending" | "Revoked";

/**
 * Public verification payload — safe to expose to anyone who scans the QR.
 *
 * Includes claim-binding fields (title, image, perceptual fingerprint, on-chain
 * work id) so a QR copied onto a different artwork is detectable: the scanned
 * page shows the real registered work, its content fingerprint, and a link to
 * the immutable on-chain record. Personal/legal identity stays owner-only.
 */
export type PublicCertificateVerification = {
    valid: boolean;
    revoked: boolean;
    /** True when the on-chain perceptual hash was read and matches our record. */
    onChainVerified: boolean;
    certificateStatus: CertificateVerificationStatus;
    artworkRegistration: "Confirmed" | "Pending";
    ownershipStatus: "Verified" | "Pending";
    artworkTitle: string;
    artworkImage: string | null;
    perceptualHash: string | null;
    workId: string | null;
    blockchain: string;
    transactionHash: string | null;
    polygonScanUrl: string | null;
    issuedAt: string;
    isOwner: false;
};

/** Owner-only payload — extends the public payload with private identity details. */
export type OwnerCertificateVerification = Omit<
    PublicCertificateVerification,
    "isOwner"
> & {
    isOwner: true;
    artistName: string;
    artistUsername: string;
    registrationDate: string;
};

export type CertificateVerification =
    | PublicCertificateVerification
    | OwnerCertificateVerification;

export type CertificateVerificationResult =
    | { found: true; data: CertificateVerification }
    | { found: false; reason: "not_found" | "invalid_id" };
