"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CommunityPageData, Post } from "../types";

const COMMUNITY_NAME = "ArtForgeLab";
const COMMUNITY_HREF = "/community";
const COMMUNITY_ICON =
    "https://styles.redditmedia.com/t5_2qk7x/styles/communityIcon_gw3ypy6d357e1.png?width=48&height=48&frame=1&auto=webp&crop=48%3A48%2Csmart&s=82b75539c0b754d2498ab3c553d8857e6215fcc5";

type ArtPostRow = {
    id: string;
    art_id: string;
    user_id: string;
    visibility: "public" | "private";
    is_archived: boolean;
    reaction_count: number;
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
};

type ArtGenreRow = {
    art_id: string;
    genres: { name: string } | { name: string }[] | null;
};

function toSingleObject<T>(value: T | T[] | null): T | null {
    if (!value) return null;
    return Array.isArray(value) ? (value[0] ?? null) : value;
}

function formatTimeAgo(isoDate: string) {
    const created = new Date(isoDate).getTime();
    const now = Date.now();
    const diffMs = Math.max(now - created, 0);

    const minutes = Math.floor(diffMs / (1000 * 60));
    if (minutes < 60) return `${Math.max(minutes, 1)} minute${minutes === 1 ? "" : "s"} ago`;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;

    const years = Math.floor(days / 365);
    return `${years} year${years === 1 ? "" : "s"} ago`;
}

function mapBadge(score: number): Post["artistBadge"] {
    if (score >= 20) return "Featured";
    if (score >= 5) return "Verified";
    return "Emerging";
}

function mapPosts(rows: ArtPostRow[], genresMap: Map<string, string[]>): Post[] {
    const posts: Post[] = [];

    for (const row of rows) {
        const artwork = toSingleObject(row.registered_arts);
        const author = toSingleObject(row.users);

        if (!artwork || !author) continue;

        const tags = genresMap.get(row.art_id) ?? [];
        const category = tags[0] ?? "Digital Artwork";

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

            score: row.reaction_count,
            category,
            excerpt: artwork.description ?? undefined,
            artistBadge: mapBadge(row.reaction_count),
            tags,

            visibility: row.visibility,
            isArchived: row.is_archived,
        });
    }

    return posts;
}

export async function getCommunityFeedData(): Promise<CommunityPageData> {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const authed = !!user;

    const { data: publicRows, error: publicError } = await supabase
        .from("art_posts")
        .select(`
      id,
      art_id,
      user_id,
      visibility,
      is_archived,
      reaction_count,
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
      )
    `)
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
            .select(`
        id,
        art_id,
        user_id,
        visibility,
        is_archived,
        reaction_count,
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
        )
      `)
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

    const posts = mapPosts(mergedRows, genresMap);

    const uniqueArtists = new Set(
        posts.filter((post) => post.visibility === "public").map((post) => post.userId)
    );

    return {
        authed,
        currentUserId: user?.id ?? null,
        currentUsername:
            posts.find((post) => post.userId === user?.id)?.username ?? null,
        posts,
        stats: {
            publishedWorks: `${posts.filter((post) => post.visibility === "public").length}+`,
            activeArtists: `${uniqueArtists.size}+`,
            protectedPosts: "Verified",
        },
    };
}