"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatTimeAgo } from "@/lib/client-utils";
import type { CommunityPageData, Post, VoteType } from "../types";

const COMMUNITY_NAME = "ArtForgeLab";
const COMMUNITY_HREF = "/community";
const COMMUNITY_ICON =
    "https://styles.redditmedia.com/t5_2qk7x/styles/communityIcon_gw3ypy6d357e1.png?width=48&height=48&frame=1&auto=webp&crop=48%3A48%2Csmart&s=82b75539c0b754d2498ab3c553d8857e6215fcc5";

type ArtReactionRow = {
    user_id: string;
    reaction_type: "upvote" | "downvote";
};

type ArtPostRow = {
    id: string;
    art_id: string;
    user_id: string;
    visibility: "public" | "private";
    is_archived: boolean;
    upvote_count: number;
    downvote_count: number;
    score: number;
    created_at: string;
    registered_arts:
    | {
        id: string;
        title: string;
        description: string | null;
        c_secure_url: string | null;
        status: string;
    }
    | {
        id: string;
        title: string;
        description: string | null;
        c_secure_url: string | null;
        status: string;
    }[]
    | null;
    users:
    | {
        id: string;
        username: string;
        full_name: string | null;
    }
    | {
        id: string;
        username: string;
        full_name: string | null;
    }[]
    | null;
    art_reactions?: ArtReactionRow[] | null;
};

type ArtGenreRow = {
    art_id: string;
    genres: { name: string } | { name: string }[] | null;
};

function toSingleObject<T>(value: T | T[] | null): T | null {
    if (!value) return null;
    return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapBadge(score: number): Post["artistBadge"] {
    if (score >= 20) return "Featured";
    if (score >= 5) return "Verified";
    return "Emerging";
}

function getCurrentUserVote(
    reactions: ArtReactionRow[] | null | undefined,
    currentUserId: string | null
): VoteType {
    if (!currentUserId || !reactions?.length) return null;

    const match = reactions.find((reaction) => reaction.user_id === currentUserId);
    return match?.reaction_type ?? null;
}

function mapPosts(
    rows: ArtPostRow[],
    genresMap: Map<string, string[]>,
    currentUserId: string | null
): Post[] {
    const posts: Post[] = [];

    for (const row of rows) {
        const artwork = toSingleObject(row.registered_arts);
        const author = toSingleObject(row.users);

        if (!artwork || !author) continue;

        const tags = genresMap.get(row.art_id) ?? [];
        const category = tags[0] ?? "Digital Artwork";
        const currentUserVote = getCurrentUserVote(row.art_reactions, currentUserId);

        posts.push({
            id: row.id,
            postId: row.id,
            artId: row.art_id,
            userId: row.user_id,

            subredditName: COMMUNITY_NAME,
            subredditHref: COMMUNITY_HREF,
            subredditIconSrc: COMMUNITY_ICON,

            username: author.username,
            userHref: `/profile/${author.username}`,

            createdAt: row.created_at,
            timeAgo: formatTimeAgo(row.created_at),

            title: artwork.title,
            imageSrc: artwork.c_secure_url || COMMUNITY_ICON,
            imageAlt: artwork.title,

            score: row.score,
            upvoteCount: row.upvote_count,
            downvoteCount: row.downvote_count,
            currentUserVote,

            category,
            excerpt: artwork.description ?? undefined,
            artistBadge: mapBadge(row.score),
            tags,

            visibility: row.visibility,
            isArchived: row.is_archived,
        });
    }

    return posts;
}

const ART_POST_SELECT = `
  id,
  art_id,
  user_id,
  visibility,
  is_archived,
  upvote_count,
  downvote_count,
  score,
  created_at,
  registered_arts!art_posts_art_id_fkey (
    id,
    title,
    description,
    c_secure_url,
    status
  ),
  users!art_posts_user_id_fkey (
    id,
    username,
    full_name
  ),
  art_reactions (
    user_id,
    reaction_type
  )
`;

export async function getCommunityFeedData(): Promise<CommunityPageData> {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const authed = Boolean(user);

    const { data: publicRows, error: publicError } = await supabase
        .from("art_posts")
        .select(ART_POST_SELECT)
        .eq("visibility", "public")
        .eq("is_archived", false)
        .eq("registered_arts.status", "active")
        .order("created_at", { ascending: false });

    if (publicError) {
        throw new Error(publicError.message);
    }

    let ownRows: ArtPostRow[] = [];

    if (user) {
        const { data, error } = await supabase
            .from("art_posts")
            .select(ART_POST_SELECT)
            .eq("user_id", user.id)
            .eq("is_archived", false)
            .eq("registered_arts.status", "active")
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        ownRows = (data ?? []) as ArtPostRow[];
    }

    const mergedMap = new Map<string, ArtPostRow>();

    for (const row of (publicRows ?? []) as ArtPostRow[]) {
        mergedMap.set(row.id, row);
    }

    for (const row of ownRows) {
        mergedMap.set(row.id, row);
    }

    const mergedRows = Array.from(mergedMap.values());
    const artIds = Array.from(new Set(mergedRows.map((row) => row.art_id)));
    const genresMap = new Map<string, string[]>();

    if (artIds.length > 0) {
        const { data: genreRows, error: genreError } = await supabase
            .from("art_genres")
            .select(`
        art_id,
        genres (
          name
        )
      `)
            .in("art_id", artIds);

        if (genreError) {
            throw new Error(genreError.message);
        }

        for (const row of (genreRows ?? []) as ArtGenreRow[]) {
            const existing = genresMap.get(row.art_id) ?? [];
            const genreValue = row.genres;

            if (Array.isArray(genreValue)) {
                for (const item of genreValue) {
                    if (item?.name && !existing.includes(item.name)) {
                        existing.push(item.name);
                    }
                }
            } else if (genreValue?.name && !existing.includes(genreValue.name)) {
                existing.push(genreValue.name);
            }

            genresMap.set(row.art_id, existing);
        }
    }

    const posts = mapPosts(mergedRows, genresMap, user?.id ?? null);

    const publicPosts = posts.filter(
        (post) => post.visibility === "public" && !post.isArchived
    );

    const uniqueArtists = new Set(publicPosts.map((post) => post.userId));

    return {
        authed,
        currentUserId: user?.id ?? null,
        currentUsername:
            posts.find((post) => post.userId === user?.id)?.username ?? null,
        posts,
        stats: {
            publishedWorks: `${publicPosts.length}+`,
            activeArtists: `${uniqueArtists.size}+`,
            protectedPosts: `${posts.length}+`,
        },
    };
}