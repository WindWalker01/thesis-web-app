export type CertificateVerificationStatus = "Valid" | "Pending";

/** Public verification payload — safe to expose to anyone who scans the QR. */
export type PublicCertificateVerification = {
    valid: boolean;
    certificateStatus: CertificateVerificationStatus;
    artworkRegistration: "Confirmed" | "Pending";
    ownershipStatus: "Verified" | "Pending";
    blockchain: string;
    transactionHash: string | null;
    polygonScanUrl: string | null;
    issuedAt: string;
    isOwner: false;
};

/** Owner-only payload — extends the public payload with private artwork details. */
export type OwnerCertificateVerification = Omit<
    PublicCertificateVerification,
    "isOwner"
> & {
    isOwner: true;
    artworkTitle: string;
    artistName: string;
    artistUsername: string;
    registrationDate: string;
    artworkImage: string | null;
};

export type CertificateVerification =
    | PublicCertificateVerification
    | OwnerCertificateVerification;

export type CertificateVerificationResult =
    | { found: true; data: CertificateVerification }
    | { found: false; reason: "not_found" | "invalid_id" };
