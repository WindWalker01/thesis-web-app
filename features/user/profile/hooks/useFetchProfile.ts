"use client";

/**
 * This file contains reusable React Query hooks for fetching user profiles.
 * These hooks handle:
 * - Data fetching
 * - Caching
 * - Loading + error states
 *
 * This keeps components clean and focused only on UI.
 */

import { useQuery } from "@tanstack/react-query";
import {
    fetchCurrentUserProfile,
    fetchUserProfileById,
    fetchUserProfileByUsername,
    type UserProfile,
} from "../server/profile";

// ── Query key factory ─────────────────────────────────────────────────────────

/**
 * Centralized query keys for all profile-related queries.
 *
 * WHY this exists:
 * - React Query uses keys to cache data
 * - If keys are inconsistent, caching breaks
 * - Makes invalidation easy and predictable
 *
 * Example:
 *   queryClient.invalidateQueries({ queryKey: profileKeys.current() })
 */
export const profileKeys = {
    all: () => ["profile"] as const,                  // base key
    current: () => ["profile", "current"] as const,       // logged-in user
    byId: (id: string) => ["profile", "id", id] as const,        // user by UUID
    byUsername: (u: string) => ["profile", "username", u] as const,   // user by username
};

// ── Shared config ─────────────────────────────────────────────────────────────

/**
 * Shared React Query configuration for profile queries.
 *
 * WHY:
 * - Profiles don’t change often → avoid unnecessary refetching
 *
 * staleTime:
 *   Data is considered "fresh" for 5 minutes
 *   → No automatic refetch during this time
 *
 * gcTime:
 *   Cache stays in memory for 10 minutes after component unmounts
 *
 * retry:
 *   Only retry once on failure (avoids spam requests)
 */
const PROFILE_QUERY_OPTIONS = {
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  retry: 1,
  meta: { persist: false }, 
} as const;

// ── Return type ───────────────────────────────────────────────────────────────

/**
 * Standard return type for all profile hooks.
 *
 * WHY:
 * - Keeps API consistent across hooks
 * - Easier for teammates to use without confusion
 */
type UseProfileReturn = {
    profile: UserProfile | null; // normalized data
    isLoading: boolean;            // loading state
    error: string | null;      // error message (if any)
    refetch: () => void;         // manual refetch trigger
};

// ── Current authenticated user ────────────────────────────────────────────────

/**
 * Fetches the currently logged-in user's profile.
 *
 * FLOW:
 * Client → React Query → Server Action → Supabase
 *
 * Automatically cached using "profile.current" key
 */
export function useCurrentUserProfile(): UseProfileReturn {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: profileKeys.current(),

        /**
         * queryFn:
         * - Calls server action
         * - Throws error if request failed
         * - React Query will catch and store it in `error`
         */
        queryFn: async () => {
            const result = await fetchCurrentUserProfile();

            if (!result.success) {
                throw new Error(result.message); // converts to React Query error
            }

            return result.profile;
        },

        ...PROFILE_QUERY_OPTIONS,
    });

    /**
     * Normalize output:
     * - Always return `profile` (never undefined)
     * - Convert error to string
     */
    return {
        profile: data ?? null,
        isLoading,
        error: error instanceof Error ? error.message : null,
        refetch,
    };
}

// ── Profile by UUID ───────────────────────────────────────────────────────────

/**
 * Fetches a profile using a user ID (UUID).
 *
 * IMPORTANT:
 * - Query is disabled until `userId` exists
 * - Prevents unnecessary API calls
 */
export function useUserProfileById(
    userId: string | null | undefined
): UseProfileReturn {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: profileKeys.byId(userId ?? ""),

        /**
         * Non-null assertion (!):
         * Safe because query is disabled when userId is falsy
         */
        queryFn: async () => {
            const result = await fetchUserProfileById(userId!);

            if (!result.success) {
                throw new Error(result.message);
            }

            return result.profile;
        },

        /**
         * Only run query when userId exists
         */
        enabled: !!userId,

        ...PROFILE_QUERY_OPTIONS,
    });

    return {
        profile: data ?? null,

        /**
         * Prevents loading state when query is disabled
         */
        isLoading: !!userId && isLoading,

        error: error instanceof Error ? error.message : null,
        refetch,
    };
}

// ── Profile by username ───────────────────────────────────────────────────────

/**
 * Fetches a profile using username.
 *
 * EXTRA FEATURE:
 * - Accepts "@username" or "username"
 * - Automatically cleans input
 */
export function useUserProfileByUsername(
    username: string | null | undefined
): UseProfileReturn {

    /**
     * Normalize username:
     * - Removes leading "@"
     */
    const clean = username
        ? username.startsWith("@") ? username.slice(1) : username
        : null;

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: profileKeys.byUsername(clean ?? ""),

        queryFn: async () => {
            const result = await fetchUserProfileByUsername(clean!);

            if (!result.success) {
                throw new Error(result.message);
            }

            return result.profile;
        },

        /**
         * Only fetch when username is valid
         */
        enabled: !!clean,

        ...PROFILE_QUERY_OPTIONS,
    });

    return {
        profile: data ?? null,
        isLoading: !!clean && isLoading,
        error: error instanceof Error ? error.message : null,
        refetch,
    };
}