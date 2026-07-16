"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
    RecognitionFact,
    RecognitionSection,
    RecognitionProfileData,
} from "../types";

/**
 * Similarity threshold: if best_similarity_percentage is below this value,
 * the similarity scan is considered clean (no significant match).
 * Above this threshold may indicate a potential match.
 */
const SIMILARITY_CLEAN_THRESHOLD = 70;

/**
 * Number of days after registration to consider an artwork "recently registered".
 */
const RECENT_REGISTRATION_DAYS = 30;

/**
 * Minimum upvote count to display a "positive community feedback" indicator.
 */
const POSITIVE_UPVOTE_THRESHOLD = 5;

export type RecognitionProfileInput = {
    postId: string;
    artId: string;
    ownerId: string;
    netScore: number;
    upvoteCount: number;
    downvoteCount: number;
    createdAt: string;
};

/**
 * Build the full Artwork Recognition Profile for a given post.
 *
 * Queries the database for all observable facts about the artwork and returns
 * them grouped into categories. No blended scores, no weighted formulas,
 * no hidden algorithms — every fact maps to a verifiable database value.
 */
export async function buildRecognitionProfile(
    input: RecognitionProfileInput,
): Promise<RecognitionProfileData> {
    const supabase = await createSupabaseServerClient();
    const adminSupabase = createAdminClient();

    const [
        blockchainFact,
        authorshipFact,
        similarityFact,
        registrationFact,
        reportsFact,
    ] = await Promise.all([
        getBlockchainFact(supabase, input.artId),
        getAuthorshipFact(supabase, input.artId),
        getSimilarityFact(supabase, input.artId),
        getRegistrationFact(input.createdAt),
        getReportsFact(adminSupabase, input.postId),
    ]);

    const sections: RecognitionSection[] = [
        {
            heading: "Community Recognition",
            facts: [
                (() => {
                    const up = input.upvoteCount;
                    const down = input.downvoteCount;
                    const isPositive = up > down;
                    const isNegative = down > up;
                    const isNeutral = up === down;

                    let satisfied: boolean;
                    let description: string;

                    if (isPositive) {
                        satisfied = true;
                        description =
                            up >= POSITIVE_UPVOTE_THRESHOLD
                                ? "Received positive feedback from the community"
                                : "Has received some community engagement";
                    } else if (isNegative) {
                        satisfied = false;
                        description = "More downvotes than upvotes — mixed community reception";
                    } else {
                        // Neutral — upvotes === downvotes
                        satisfied = up > 0;
                        description = "Equal upvotes and downvotes — neutral community reception";
                    }

                    return {
                        key: "upvotes",
                        label: "Community Upvotes",
                        satisfied,
                        detail: `${up} upvote${up === 1 ? "" : "s"}, ${down} downvote${down === 1 ? "" : "s"}`,
                        description,
                    };
                })(),
            ],
        },
        {
            heading: "Protection & Registration",
            facts: [
                registrationFact,
                blockchainFact,
                authorshipFact,
            ].filter((f) => f !== null),
        },
        {
            heading: "Integrity Checks",
            facts: [similarityFact, reportsFact].filter((f) => f !== null),
        },
    ];

    // Remove empty sections
    const nonEmptySections = sections.filter((s) => s.facts.length > 0);

    return {
        sections: nonEmptySections,
        generatedAt: new Date().toISOString(),
    };
}

/**
 * Fetch blockchain registration status.
 */
async function getBlockchainFact(
    supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
    artId: string,
): Promise<RecognitionFact | null> {
    const { data } = await supabase
        .from("registered_arts")
        .select("tx_hash, chain, work_id")
        .eq("id", artId)
        .maybeSingle();

    const hasBlockchain = Boolean(data?.tx_hash && data?.chain);

    return {
        key: "blockchain",
        label: "Blockchain Record",
        satisfied: hasBlockchain,
        detail: hasBlockchain
            ? `Recorded on ${data!.chain}`
            : "Not yet recorded on blockchain",
        description: hasBlockchain
            ? "Transaction is recorded and verifiable on-chain"
            : "Blockchain registration is pending",
    };
}

/**
 * Fetch proof of authorship / ownership verification status.
 * Uses the artwork_reviews table to check if authorship has been verified.
 */
async function getAuthorshipFact(
    supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
    artId: string,
): Promise<RecognitionFact> {
    // Check if the artwork has an approved review
    const { data: reviewData } = await supabase
        .from("artwork_reviews")
        .select("status")
        .eq("artwork_id", artId)
        .maybeSingle();

    const isApproved = reviewData?.status === "approved";

    return {
        key: "authorship",
        label: "Proof of Authorship",
        satisfied: isApproved,
        detail: isApproved
            ? "Authorship evidence verified"
            : "Pending authorship verification",
        description: isApproved
            ? "Authorship evidence has been reviewed and verified"
            : "Authorship evidence has been submitted and is awaiting review",
    };
}

/**
 * Fetch similarity scan results.
 */
async function getSimilarityFact(
    supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
    artId: string,
): Promise<RecognitionFact> {
    const { data } = await supabase
        .from("art_similarity_scans")
        .select("best_similarity_percentage, success, status")
        .eq("art_id", artId)
        .maybeSingle();

    if (!data || data.status !== "completed") {
        return {
            key: "similarity_scan",
            label: "Similarity Scan",
            satisfied: false,
            detail: "Not yet completed",
            description: "A visual similarity scan has not been performed on this artwork",
        };
    }

    if (!data.success) {
        return {
            key: "similarity_scan",
            label: "Similarity Scan",
            satisfied: false,
            detail: "Scan encountered an error",
            description: "The similarity scan was unable to complete successfully",
        };
    }

    const sim = data.best_similarity_percentage;
    const isClean = sim === null || sim < SIMILARITY_CLEAN_THRESHOLD;

    return {
        key: "similarity_scan",
        label: "Similarity Scan",
        satisfied: isClean,
        detail: isClean
            ? "No significant visual matches detected"
            : `Potential match detected (${sim}% similarity)`,
        description: isClean
            ? "Automated visual comparison found no highly similar artworks in the database or web sources"
            : "Automated visual comparison found a potential match that may require review",
    };
}

/**
 * Build registration timestamp fact.
 */
async function getRegistrationFact(
    createdAt: string,
): Promise<RecognitionFact> {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const daysSinceRegistration = Math.floor(
        (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const isRecent = daysSinceRegistration <= RECENT_REGISTRATION_DAYS;

    const formattedDate = createdDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return {
        key: "registration",
        label: "Registered",
        satisfied: true,
        detail: formattedDate,
        description: isRecent
            ? "Protected since registration — provides timestamped proof of creation"
            : `Registered ${formattedDate} — timestamped proof of creation on file`,
    };
}

/**
 * Count open reports against this post.
 */
async function getReportsFact(
    adminSupabase: ReturnType<typeof createAdminClient>,
    postId: string,
): Promise<RecognitionFact> {
    const { count } = await adminSupabase
        .from("reports")
        .select("id", { count: "exact", head: true })
        .eq("reported_art_post_id", postId)
        .eq("status", "pending_review");

    const openCount = count ?? 0;

    return {
        key: "reports",
        label: "Copyright Reports",
        satisfied: openCount === 0,
        detail: openCount === 0
            ? "No active reports"
            : `${openCount} open report${openCount === 1 ? "" : "s"}`,
        description: openCount === 0
            ? "No unresolved copyright or infringement reports against this artwork"
            : "There are unresolved reports associated with this artwork",
    };
}

/**
 * Create a Supabase admin client for bypassing RLS.
 * Uses the service role key for elevated queries (report counts, etc.).
 */
function createAdminClient() {
    return createSupabaseAdminClient();
}