export type OwnershipRecord = {
    id: string;
    artwork: string;
    hash: string;
    tx: string | null;
    date: string;
    verified: boolean;
};
