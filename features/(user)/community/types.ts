export type ArtistBadge =
    | "Emerging"
    | "Recognized"
    | "Acclaimed"
    | "Master";

/**
 * Numeric artist reputation (0–100) plus a short supporting summary. Distinct
 * from the `ArtistBadge` tier: the badge is a coarse label, reputation is a
 * blended score surfaced only in the post viewer's author area.
 */
export type ArtistReputation = {
    score: number;
    summary: string;
};

export type PostVisibility = "public" | "private";

export type VoteType = "upvote" | "downvote" | null;

export type Post = {
    id: string;
    postId: string;
    artId: string;
    userId: string;

    subredditName: string;
    subredditHref?: string;

    username: string;
    userHref?: string;
    fullName?: string;
    profileImage?: string | null;

    createdAt: string;
    timeAgo: string;

    title: string;
    imageSrc: string;
    imageAlt?: string;

    score: number;
    upvoteCount: number;
    downvoteCount: number;
    currentUserVote: VoteType;

    category?: string;
    excerpt?: string;
    artistBadge?: ArtistBadge;
    artistReputation?: ArtistReputation;
    tags?: string[];

    visibility: PostVisibility;
    isArchived: boolean;
    isNsfw: boolean;
    hasReported: boolean;
};
export type FeedScope = "community" | "mine";
export type VisibilityFilter = "all" | "public" | "private";
export type SortOption = "newest" | "oldest" | "highest-score" | "most-upvoted";

export type CommunityPageData = {
    authed: boolean;
    currentUserId: string | null;
    currentUsername: string | null;
    posts: Post[];
    stats: {
        publishedWorks: string;
        activeArtists: string;
        protectedPosts: string;
    };
};