"use client";

import { useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import {
    PersistQueryClientProvider,
    type Persister,
    type PersistedClient,
} from "@tanstack/react-query-persist-client";
import { get, set, del, createStore } from "idb-keyval";

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