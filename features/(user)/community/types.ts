export type Post = {
    id: string;
    subredditName: string;
    subredditHref: string;
    subredditIconSrc: string;
    username: string;
    userHref: string;
    timeAgo: string;
    title: string;
    imageSrc: string;
    score: string;
    category?: string;
    excerpt?: string;
    artistBadge?: "Verified" | "Emerging" | "Featured";
    tags?: string[];
};