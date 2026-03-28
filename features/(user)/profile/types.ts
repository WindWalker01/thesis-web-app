export type OwnershipStatus = "verified" | "pending";
export type HashStatus = "complete" | "processing";
export type ViewMode = "grid" | "list";

export type Artwork = {
    id: number;
    title: string;
    category: string;
    uploadDate: string;
    ownershipStatus: OwnershipStatus;
    hashStatus: HashStatus;
    color: string;
    img?: string;
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