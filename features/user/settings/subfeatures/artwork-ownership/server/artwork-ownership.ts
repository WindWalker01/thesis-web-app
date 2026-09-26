"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { OwnershipRecord } from "../types";
import { formatDate, truncateHash } from "@/lib/client-utils";

type FetchOwnershipRecordsResult =
    | { success: true; records: OwnershipRecord[] }
    | { success: false; message: string };

type RawOwnershipRow = {
    id: string;
    title: string;
    file_hash: string;
    tx_hash: string | null;
    status: string;
    created_at: string;
};

export async function fetchCurrentUserOwnershipRecords(): Promise<FetchOwnershipRecordsResult> {
    try {
        const supabase = await createSupabaseServerClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, message: "Not authenticated." };
        }

        const { data, error } = await supabase
            .from("registered_arts")
            .select(`
                id,
                title,
                file_hash,
                tx_hash,
                status,
                created_at
            `)
            .eq("owner_id", user.id)
            .in("status", ["active", "pending_blockchain"])
            .order("created_at", { ascending: false });

        if (error) {
            return { success: false, message: error.message };
        }

        const records: OwnershipRecord[] = ((data ?? []) as RawOwnershipRow[]).map((row) => ({
            id: row.id,
            artwork: row.title,
            hash: truncateHash(row.file_hash),
            tx: row.tx_hash ? truncateHash(row.tx_hash) : null,
            date: formatDate(row.created_at),
            verified: row.status === "active" && !!row.tx_hash,
        }));

        return { success: true, records };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch ownership records.",
        };
    }
}