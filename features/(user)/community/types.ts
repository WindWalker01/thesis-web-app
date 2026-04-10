export type ArtistBadge = "Verified" | "Emerging" | "Featured";

export type PostVisibility = "public" | "private";

export type VoteType = "upvote" | "downvote" | null;

export type Post = {
    id: string;
    postId: string;
    artId: string;
    userId: string;

    subredditName: string;
    subredditHref?: string;
    subredditIconSrc: string;

    username: string;
    userHref?: string;

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
    tags?: string[];

    visibility: PostVisibility;
    isArchived: boolean;
};

export type FeedScope = "community" | "mine";
export type VisibilityFilter = "all" | "public" | "private";
export type SortOption = "newest" | "oldest";

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