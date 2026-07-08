"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

async function verifyAdmin(supabase: SupabaseClient): Promise<string> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Not authenticated");
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") throw new Error("Not authorized");
  return user.id;
}

export async function exportArtworksCSV(
  filters?: {
    status?: string;
    date_from?: string;
    date_to?: string;
  }
): Promise<string> {
  const supabase = await createSupabaseServerClient();
  await verifyAdmin(supabase);

  let query = supabase
    .from("registered_arts")
    .select(
      `
      id, title, description, file_hash, perceptual_hash,
      chain, tx_hash, block_number, work_id, status, created_at,
      owner:users!registered_arts_owner_id_fkey (
        username, first_name, last_name, email
      )
    `
    );

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters?.date_from) {
    query = query.gte("created_at", filters.date_from);
  }
  if (filters?.date_to) {
    query = query.lte("created_at", filters.date_to);
  }

  const { data } = await query.order("created_at", { ascending: false });
  if (!data) return "";

  const headers = [
    "ID",
    "Title",
    "Description",
    "Artist Username",
    "Artist Name",
    "Artist Email",
    "File Hash",
    "Perceptual Hash",
    "Chain",
    "Transaction Hash",
    "Block Number",
    "Work ID",
    "Status",
    "Created At",
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
const rows = data.map((row: any) => [
    row.id,
    `"${(row.title ?? "").replace(/"/g, '""')}"`,
    `"${(row.description ?? "").replace(/"/g, '""')}"`,
    `"${(row.owner?.username ?? "").replace(/"/g, '""')}"`,
    `"${((row.owner?.first_name ?? "") + " " + (row.owner?.last_name ?? "")).trim().replace(/"/g, '""')}"`,
    `"${(row.owner?.email ?? "").replace(/"/g, '""')}"`,
    row.file_hash ?? "",
    row.perceptual_hash ?? "",
    row.chain ?? "",
    row.tx_hash ?? "",
    row.block_number ?? "",
    row.work_id ?? "",
    row.status,
    row.created_at,
  ]);

  return [headers.join(","), ...rows.map((r: string[]) => r.join(","))].join("\n");
}