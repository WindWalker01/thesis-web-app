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

/**
 * A single observable fact about an artwork that contributes to its
 * community recognition. Each fact maps directly to a verifiable database
 * value — no computed scores, no weighted algorithms.
 */
export type RecognitionFact = {
    /** Unique key for this fact (e.g. "upvotes", "blockchain", "similarity_scan") */
    key: string;
    /** Human-readable label (e.g. "Community Upvotes") */
    label: string;
    /** Whether this fact is satisfied / positive */
    satisfied: boolean;
    /** The actual observed value (e.g. "42 upvotes") */
    detail: string;
    /** Short description of what this fact means */
    description: string;
};

/**
 * A named group of related recognition facts.
 */
export type RecognitionSection = {
    /** Section heading (e.g. "Community Recognition", "Protection & Registration") */
    heading: string;
    /** Facts belonging to this section */
    facts: RecognitionFact[];
};

/**
 * Artwork-level recognition profile — a collection of observable facts
 * grouped into meaningful categories. No blended scores, no weighted
 * formulas, no hidden algorithms. Every value is a verifiable database fact.
 */
export type RecognitionProfileData = {
    /** Grouped recognition facts */
    sections: RecognitionSection[];
    /** ISO timestamp of when this profile was generated */
    generatedAt: string;
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
    recognitionProfile?: RecognitionProfileData;
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