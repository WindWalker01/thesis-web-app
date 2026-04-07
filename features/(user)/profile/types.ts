export type OwnershipStatus = "verified" | "pending";
export type HashStatus = "complete" | "processing";
export type ViewMode = "grid" | "list";

export type Artwork = {
    id: string;
    title: string;
    img: string | null;
    category: string;
    uploadDate: string;
    ownershipStatus: OwnershipStatus;
    hashStatus: HashStatus;
    color: string;
    createdAt: string;
};

export type Profile = {
    name: string;
    handle: string;
    bio: string;
    joinDate: string;
    totalArtworks: number;
    totalScans: number;
    verifiedCount: number;
    initials: string;
};

export type Category = {
    label: string;
    img: string;
};

export type FilterState = {
    searchQuery: string;
    selectedCategory: string | null;
    selectedStatus: OwnershipStatus | null;
    selectedHash: HashStatus | null;
    sortBy: string;
};

export type ArtworkDetail = {
    id: string;
    ownerId: string;
    title: string;
    description: string | null;
    img: string | null;
    category: string;
    uploadDate: string;
    createdAt: string;
    ownershipStatus: OwnershipStatus;
    hashStatus: HashStatus;

    fileHash: string;
    perceptualHash: string;
    authorIdHash: string | null;
    evidenceHash: string | null;
    evidence: unknown | null;

    chain: string | null;
    txHash: string | null;
    blockNumber: number | null;
    workId: string | null;
    status: string;

    plagiarismHashes: unknown | null;

    creator: {
        id: string;
        fullName: string;
        username: string;
        profileImage: string | null;
    } | null;
};