"use server";

/**
 * This file contains server actions for fetching user profiles.
 *
 * Responsibilities:
 * - Communicate with Supabase
 * - Handle errors safely
 * - Transform raw DB data → frontend-friendly format
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Clean, frontend-friendly type.
 * This is what the UI consumes.
 */
export type UserProfile = {
    id: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    username: string;
    bio: string | null;
    profileImage: string | null;
    role: "user" | "admin";
    joinDate: string;
    initials: string;
    isVerified: boolean;
};

/**
 * Standard API response format.
 *
 * WHY:
 * - Avoids throwing errors on server
 * - Makes handling predictable on client
 */
type FetchProfileResult =
    | { success: true; profile: UserProfile }
    | { success: false; message: string };

/**
 * Gets the currently logged-in user.
 *
 * STEP 1: Get auth user from Supabase
 * STEP 2: Reuse fetchUserProfileById (avoid duplication)
 */
export async function fetchCurrentUserProfile(): Promise<FetchProfileResult> {
    try {
        const supabase = await createSupabaseServerClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, message: "Not authenticated." };
        }

        // Reuse logic instead of duplicating query
        return fetchUserProfileById(user.id);

    } catch (err) {
        return {
            success: false,
            message: err instanceof Error ? err.message : "Failed to fetch profile.",
        };
    }
}

/**
 * Fetch profile using user ID.
 */
export async function fetchUserProfileById(
    userId: string
): Promise<FetchProfileResult> {
    try {
        const supabase = await createSupabaseServerClient();

        /**
         * Query the "users" table
         */
        const { data, error } = await supabase
            .from("users")
            .select("id, first_name, middle_name, last_name, username, bio, c_profile_image, role, created_at, is_verified")
            .eq("id", userId)
            .single();

        if (error) {
            return { success: false, message: error.message };
        }

        if (!data) {
            return { success: false, message: "User not found." };
        }

        return {
            success: true,

            /**
             * Transform raw DB data → clean UI format
             */
            profile: mapToUserProfile(data),
        };

    } catch (err) {
        return {
            success: false,
            message: err instanceof Error ? err.message : "Failed to fetch profile.",
        };
    }
}

/**
 * Fetch profile using username instead of ID.
 */
export async function fetchUserProfileByUsername(
    username: string
): Promise<FetchProfileResult> {
    try {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from("users")
            .select("id, first_name, middle_name, last_name, username, bio, c_profile_image, role, created_at, is_verified")
            .eq("username", username)
            .single();

        if (error) {
            return { success: false, message: error.message };
        }

        if (!data) {
            return { success: false, message: "User not found." };
        }

        return {
            success: true,
            profile: mapToUserProfile(data),
        };

    } catch (err) {
        return {
            success: false,
            message: err instanceof Error ? err.message : "Failed to fetch profile.",
        };
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Raw database shape (matches Supabase table)
 */
type RawUser = {
    id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    username: string;
    bio: string | null;
    c_profile_image: string | null;
    role: string;
    created_at: string;
    is_verified: boolean;
};

/**
 * Converts database format → UI-friendly format
 *
 * WHY:
 * - Keeps UI clean
 * - Central place for transformations
 */
function mapToUserProfile(raw: RawUser): UserProfile {
    return {
        id: raw.id,
        firstName: raw.first_name,
        middleName: raw.middle_name,
        lastName: raw.last_name,
        username: `@${raw.username}`,
        bio: raw.bio,
        profileImage: raw.c_profile_image,
        role: raw.role as UserProfile["role"],
        joinDate: formatJoinDate(raw.created_at),
        initials: deriveInitials(raw.first_name, raw.last_name),
        isVerified: raw.is_verified,
    };
}

/**
 * Formats ISO date → "Month Year"
 * Example: "2026-01-01" → "January 2026"
 */
function formatJoinDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });
}

/**
 * Generates initials from full name
 * Example:
 *   "John Doe" → "JD"
 *   "Plato" → "P"
 */
function deriveInitials(firstName: string, lastName: string): string {
    return (
        (firstName.charAt(0) ?? "") +
        (lastName.charAt(0) ?? "")
    ).toUpperCase();
}