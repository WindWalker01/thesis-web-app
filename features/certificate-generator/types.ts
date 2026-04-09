export type CertificateArtwork = {
    id: string;
    title: string;
    description: string | null;
    img: string | null;
    category: string;
    uploadDate: string;
    createdAt: string;

    ownershipStatus: "verified" | "pending";

    fileHash: string;
    perceptualHash: string;
    authorIdHash: string | null;
    evidenceHash: string | null;

    chain: string | null;
    txHash: string | null;
    blockNumber: number | null;
    workId: string | null;
    status: string;

    creator: {
        id: string;
        fullName: string;
        username: string;
        profileImage: string | null;
    } | null;
};