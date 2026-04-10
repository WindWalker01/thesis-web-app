export type PostEditorMode = "create" | "edit";

export type PostVisibility = "public" | "private";

export type ArtworkStatus =
    | "active"
    | "protected"
    | "pending_blockchain"
    | "flagged"
    | "removed"
    | "pending_review"
    | string;

export type UserArtworkOption = {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    createdAt: string;
    status: ArtworkStatus;
    alreadyPosted: boolean;
};

export type ExistingPostRecord = {
    id: string;
    artId: string;
    userId: string;
    visibility: PostVisibility;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
};

export type PostEditorInitialData = {
    artworks: UserArtworkOption[];
    existingPost: ExistingPostRecord | null;
};

export type UpsertPostInput = {
    postId?: string;
    artId: string;
    visibility: PostVisibility;
};

export type UpsertPostResult =
    | {
        success: true;
        postId: string;
        message: string;
    }
    | {
        success: false;
        message: string;
        fieldErrors?: Partial<Record<"artId" | "visibility", string[]>>;
    };