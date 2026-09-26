"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatTimeAgo } from "@/lib/client-utils";
import type {
    DashboardActivityItem,
    DashboardChartPoint,
    DashboardData,
    DashboardResult,
    DashboardTimeRange,
    DashboardTopPost,
} from "../types";

type RegisteredArtRow = {
    id: string;
    title: string;
    status:
    | "active"
    | "under_review"
    | "pending_blockchain"
    | "flagged"
    | "removed"
    | "blockchain_failed"
    | "revoked";
    tx_hash: string | null;
    created_at: string;
};

type ArtPostRow = {
    id: string;
    art_id: string;
    created_at: string;
    upvote_count: number;
    downvote_count: number;
    registered_arts:
    | {
        title: string;
        c_secure_url: string | null;
    }
    | {
        title: string;
        c_secure_url: string | null;
    }[]
    | null;
};

type ReactionRow = {
    post_id: string;
    created_at: string;
    reaction_type: "upvote" | "downvote";
};

type NotificationRow = {
    id: string;
    type: string;
    title: string;
    message: string;
    created_at: string;
};

type ArtGenreRow = {
    art_id: string;
    genres: { name: string } | { name: string }[] | null;
};

function toSingleObject<T>(value: T | T[] | null): T | null {
    if (!value) return null;
    return Array.isArray(value) ? (value[0] ?? null) : value;
}

function formatCompactNumber(value: number): string {
    return new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);
}

function buildEmptyChartData(): Record<DashboardTimeRange, DashboardChartPoint[]> {
    return {
        "24h": [],
        "7d": [],
        "1m": [],
        "1y": [],
        max: [],
    };
}

function buildChartData(reactions: ReactionRow[]): Record<DashboardTimeRange, DashboardChartPoint[]> {
    const now = new Date();

    const upvotes = reactions.filter((item) => item.reaction_type === "upvote");

    return {
        "24h": build24hChart(upvotes, now),
        "7d": build7dChart(upvotes, now),
        "1m": build1mChart(upvotes, now),
        "1y": build1yChart(upvotes, now),
        max: buildMaxChart(upvotes),
    };
}

function build24hChart(rows: ReactionRow[], now: Date): DashboardChartPoint[] {
    const labels = ["12a", "2a", "4a", "6a", "8a", "10a", "12p", "2p", "4p", "6p", "8p", "10p"];
    const counts = new Array(labels.length).fill(0);

    const start = new Date(now);
    start.setHours(now.getHours() - 24);

    for (const row of rows) {
        const date = new Date(row.created_at);
        if (date < start) continue;

        const hour = date.getHours();
        const bucket = Math.floor(hour / 2);
        if (bucket >= 0 && bucket < counts.length) counts[bucket] += 1;
    }

    return labels.map((label, idx) => ({ label, votes: counts[idx] }));
}

function build7dChart(rows: ReactionRow[], now: Date): DashboardChartPoint[] {
    const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = new Map<string, number>(labels.map((label) => [label, 0]));

    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    for (const row of rows) {
        const date = new Date(row.created_at);
        if (date < start) continue;
        const label = labels[date.getDay()];
        counts.set(label, (counts.get(label) ?? 0) + 1);
    }

    const ordered: DashboardChartPoint[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const label = labels[d.getDay()];
        ordered.push({ label, votes: counts.get(label) ?? 0 });
    }

    return ordered;
}

function build1mChart(rows: ReactionRow[], now: Date): DashboardChartPoint[] {
    const counts = new Map<string, number>();
    const orderedLabels: string[] = [];

    for (let i = 29; i >= 0; i -= 3) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        orderedLabels.push(label);
        counts.set(label, 0);
    }

    const start = new Date(now);
    start.setDate(now.getDate() - 29);
    start.setHours(0, 0, 0, 0);

    for (const row of rows) {
        const date = new Date(row.created_at);
        if (date < start) continue;

        let nearestLabel = orderedLabels[0];
        let nearestDiff = Number.POSITIVE_INFINITY;

        for (const label of orderedLabels) {
            const labelDate = new Date(`${label}, ${now.getFullYear()}`);
            const diff = Math.abs(date.getTime() - labelDate.getTime());
            if (diff < nearestDiff) {
                nearestDiff = diff;
                nearestLabel = label;
            }
        }

        counts.set(nearestLabel, (counts.get(nearestLabel) ?? 0) + 1);
    }

    return orderedLabels.map((label) => ({
        label,
        votes: counts.get(label) ?? 0,
    }));
}

function build1yChart(rows: ReactionRow[], now: Date): DashboardChartPoint[] {
    const ordered: DashboardChartPoint[] = [];

    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString("en-US", { month: "short" });

        const count = rows.filter((row) => {
            const date = new Date(row.created_at);
            return (
                date.getFullYear() === d.getFullYear() &&
                date.getMonth() === d.getMonth()
            );
        }).length;

        ordered.push({ label, votes: count });
    }

    return ordered;
}

function buildMaxChart(rows: ReactionRow[]): DashboardChartPoint[] {
    const byYear = new Map<number, number>();

    for (const row of rows) {
        const year = new Date(row.created_at).getFullYear();
        byYear.set(year, (byYear.get(year) ?? 0) + 1);
    }

    return Array.from(byYear.entries())
        .sort(([a], [b]) => a - b)
        .map(([year, votes]) => ({
            label: String(year),
            votes,
        }));
}

function getTrend(postId: string, reactions: ReactionRow[]): "up" | "down" {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUpvotes = reactions.filter(
        (reaction) =>
            reaction.post_id === postId &&
            reaction.reaction_type === "upvote" &&
            new Date(reaction.created_at) >= sevenDaysAgo
    ).length;

    return recentUpvotes > 0 ? "up" : "down";
}

function activityToneFromNotificationType(type: string): DashboardActivityItem["tone"] {
    if (type === "blockchain_recorded") return "verified";
    if (type === "scan_flagged" || type === "report_submitted" || type === "report_resolved") return "issue";
    if (type === "artwork_registered") return "upload";
    if (type === "scan_completed") return "upvote";
    return "default";
}

function getColorByIndex(index: number): string {
    const palette = [
        "from-blue-500 to-purple-600",
        "from-violet-500 to-indigo-600",
        "from-orange-500 to-red-600",
        "from-cyan-500 to-blue-500",
    ];

    return palette[index % palette.length];
}

export async function fetchDashboardData(): Promise<DashboardResult> {
    try {
        const supabase = await createSupabaseServerClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, message: "Not authenticated." };
        }

        const { data: artworks, error: artworksError } = await supabase
            .from("registered_arts")
            .select("id, title, status, tx_hash, created_at")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: false });

        if (artworksError) {
            return { success: false, message: artworksError.message };
        }

        const safeArtworks = (artworks ?? []) as RegisteredArtRow[];
        const artIds = safeArtworks.map((art) => art.id);

        const { data: posts, error: postsError } = await supabase
            .from("art_posts")
            .select(`
        id,
        art_id,
        created_at,
        upvote_count,
        downvote_count,
        registered_arts!art_posts_art_id_fkey (
          title,
          c_secure_url
        )
      `)
            .eq("user_id", user.id)
            .eq("is_archived", false)
            .order("upvote_count", { ascending: false });

        if (postsError) {
            return { success: false, message: postsError.message };
        }

        const safePosts = (posts ?? []) as ArtPostRow[];
        const postIds = safePosts.map((post) => post.id);

        let reactions: ReactionRow[] = [];
        if (postIds.length > 0) {
            const { data, error } = await supabase
                .from("art_reactions")
                .select("post_id, created_at, reaction_type")
                .in("post_id", postIds);

            if (error) {
                return { success: false, message: error.message };
            }

            reactions = (data ?? []) as ReactionRow[];
        }

        const genresByArtId = new Map<string, string[]>();

        if (artIds.length > 0) {
            const { data: artGenres, error: artGenresError } = await supabase
                .from("art_genres")
                .select(`
          art_id,
          genres (
            name
          )
        `)
                .in("art_id", artIds);

            if (artGenresError) {
                return { success: false, message: artGenresError.message };
            }

            for (const row of (artGenres ?? []) as ArtGenreRow[]) {
                const existing = genresByArtId.get(row.art_id) ?? [];
                const genreValue = row.genres;

                if (Array.isArray(genreValue)) {
                    for (const item of genreValue) {
                        if (item?.name && !existing.includes(item.name)) existing.push(item.name);
                    }
                } else if (genreValue?.name && !existing.includes(genreValue.name)) {
                    existing.push(genreValue.name);
                }

                genresByArtId.set(row.art_id, existing);
            }
        }

        const { data: notifications, error: notificationsError } = await supabase
            .from("notifications")
            .select("id, type, title, message, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(4);

        if (notificationsError) {
            return { success: false, message: notificationsError.message };
        }

        const safeNotifications = (notifications ?? []) as NotificationRow[];

        const totalArtworks = safeArtworks.length;
        const verified = safeArtworks.filter((art) => Boolean(art.tx_hash)).length;
        const openIssues = safeArtworks.filter((art) =>
            ["flagged", "removed", "revoked", "blockchain_failed"].includes(art.status)
        ).length;

        const totalUpvotesNumber = safePosts.reduce(
            (sum, post) => sum + (post.upvote_count ?? 0),
            0
        );

        const topPosts: DashboardTopPost[] = safePosts.slice(0, 4).map((post, index) => {
            const art = toSingleObject(post.registered_arts);
            const categories = genresByArtId.get(post.art_id) ?? [];

            return {
                id: post.id,
                title: art?.title ?? "Untitled Artwork",
                category: categories[0] ?? "Uncategorized",
                upvotes: post.upvote_count ?? 0,
                views: 0,
                trend: getTrend(post.id, reactions),
                color: getColorByIndex(index),
                timeAgo: formatTimeAgo(post.created_at),
            };
        });

        const chartData =
            reactions.length > 0 ? buildChartData(reactions) : buildEmptyChartData();

        const recentActivity: DashboardActivityItem[] = safeNotifications.map((item) => ({
            id: item.id,
            text: item.message || item.title,
            time: formatTimeAgo(item.created_at),
            tone: activityToneFromNotificationType(item.type),
        }));

        const data: DashboardData = {
            stats: {
                totalArtworks,
                verified,
                totalUpvotes: totalUpvotesNumber,
                openIssues,
            },
            heroStats: {
                artworks: `${totalArtworks} total`,
                verified: `${verified} on-chain`,
                upvotes: `${formatCompactNumber(totalUpvotesNumber)} total`,
                phashCheck: "Active",
                cryptoHash: "Integrity",
            },
            chartData,
            topPosts,
            engagement: {
                totalUpvotes: totalUpvotesNumber.toLocaleString(),
                totalViews: "—",
                avgUpvotesPerPost:
                    safePosts.length > 0
                        ? (totalUpvotesNumber / safePosts.length).toFixed(1)
                        : "0.0",
                mostUpvotedTitle: topPosts[0]?.title ?? "No posts yet",
            },
            recentActivity,
            protectedArtworks: verified,
        };

        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Failed to load dashboard.",
        };
    }
}