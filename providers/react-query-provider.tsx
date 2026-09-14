"use client";

import { useState } from "react";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import {
    PersistQueryClientProvider,
    type Persister,
    type PersistedClient,
} from "@tanstack/react-query-persist-client";
import { get, set, del, createStore } from "idb-keyval";
import { isGatewayTimeoutError } from "@/lib/connection-issue";
import { showConnectionIssueModal } from "@/components/blocks/connection-issue-modal";

// ── IndexedDB store ───────────────────────────────────────────────────────────
// A dedicated IDB database so our cache never conflicts with other idb-keyval
// usage elsewhere in the app.
const idbStore = createStore("thesis-web-app", "query-cache");

const CACHE_KEY = "app-cache-v1";

const idbPersister: Persister = {
    persistClient: async (client: PersistedClient) => {
        await set(CACHE_KEY, client, idbStore);
    },
    restoreClient: async (): Promise<PersistedClient | undefined> => {
        return await get<PersistedClient>(CACHE_KEY, idbStore);
    },
    removeClient: async () => {
        await del(CACHE_KEY, idbStore);
    },
};

// ── Provider ──────────────────────────────────────────────────────────────────

/**
 * Global error handling for connection-class failures (502/503/504 gateway
 * timeouts, network drops, request timeouts). Any query or mutation that
 * fails this way opens the shared ConnectionIssueModal with a Retry action —
 * no per-component wiring needed.
 */
function handleConnectionIssueError(
    error: unknown,
    retry: () => void,
) {
    if (isGatewayTimeoutError(error)) {
        showConnectionIssueModal({ retry });
    }
}

export function ReactQueryClientProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        gcTime: 1000 * 60 * 60 * 24, // 24 hours — must be ≥ maxAge below
                        staleTime: 1000 * 60,            // 1 minute default (overridden per-query)
                        refetchOnWindowFocus: true,
                        refetchOnReconnect: true,
                    },
                },
                queryCache: new QueryCache({
                    onError: (error, query) =>
                        handleConnectionIssueError(error, () => query.fetch()),
                }),
                mutationCache: new MutationCache({
                    onError: (error, variables, _context, mutation) =>
                        handleConnectionIssueError(error, () =>
                            mutation.execute(variables),
                        ),
                }),
            })
    );

    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{
                persister: idbPersister,
                // Keep the IDB snapshot for 24 hours — matches gcTime above
                maxAge: 1000 * 60 * 60 * 24,
                dehydrateOptions: {
                    shouldDehydrateQuery: (query) => {
                        // Only persist queries that:
                        //  1. completed successfully
                        //  2. haven't explicitly opted out via meta: { persist: false }
                        const isSuccess = query.state.status === "success";
                        const isPersistable = query.meta?.persist !== false;
                        return isSuccess && isPersistable;
                    },
                },
            }}
        >
            {children}
        </PersistQueryClientProvider>
    );
}

export async function clearQueryCache() {
    await del(CACHE_KEY, idbStore);
}