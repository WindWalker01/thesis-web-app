"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Artwork, ArtworkStatus, ProfileScope } from "../types";
import {
  formatUploadDate,
  getStatusesForScope,
  mapHashStatus,
  mapOwnershipStatus,
} from "..";
import {
  canDeleteArtwork,
  canEditArtwork,
  hasBlockchainRecord,
} from "../lib/artwork-permissions";

type FetchArtworksResult =
  | { success: true; artworks: Artwork[] }
  | { success: false; message: string };

type RawArtworkRow = {
  id: string;
  title: string;
  description: string | null;
  c_secure_url: string | null;
  status: ArtworkStatus;
  created_at: string;
  tx_hash: string | null;
  perceptual_hash: string | null;
  chain: string | null;
  block_number: number | null;
  work_id: string | null;
};

type RawArtGenreRow = {
  art_id: string;
  genre_id: number;
};

type RawGenreRow = {
  id: number;
  name: string;
};

export async function fetchCurrentUserArtworks(
  scope: ProfileScope = "gallery"
): Promise<FetchArtworksResult> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Not authenticated." };
    }

    const allowedStatuses = getStatusesForScope(scope);

    const { data: arts, error: artsError } = await supabase
      .from("registered_arts")
      .select(`
                id,
                title,
                description,
                c_secure_url,
                status,
                created_at,
                tx_hash,
                perceptual_hash,
                chain,
                block_number,
                work_id
            `)
      .eq("owner_id", user.id)
      .in("status", allowedStatuses)
      .order("created_at", { ascending: false });

    if (artsError) {
      return { success: false, message: artsError.message };
    }

    const artIds = (arts ?? []).map((a) => a.id);

    if (artIds.length === 0) {
      return { success: true, artworks: [] };
    }

    const { data: artGenres, error: artGenresError } = await supabase
      .from("art_genres")
      .select("art_id, genre_id")
      .in("art_id", artIds)
      .order("genre_id", { ascending: true });

    if (artGenresError) {
      return { success: false, message: artGenresError.message };
    }

    const genreIds = [...new Set((artGenres ?? []).map((row) => row.genre_id))];

    let genres: RawGenreRow[] = [];

    if (genreIds.length > 0) {
      const { data, error: genresError } = await supabase
        .from("genres")
        .select("id, name")
        .in("id", genreIds);

      if (genresError) {
        return { success: false, message: genresError.message };
      }

      genres = (data ?? []) as RawGenreRow[];
    }

    const genreMap = new Map(genres.map((genre) => [genre.id, genre.name]));
    const genreByArtId = new Map<string, string[]>();

    for (const row of (artGenres ?? []) as RawArtGenreRow[]) {
      const existing = genreByArtId.get(row.art_id) ?? [];
      const genreName = genreMap.get(row.genre_id);

      if (genreName) {
        existing.push(genreName);
      }

      genreByArtId.set(row.art_id, existing);
    }

    const artworks: Artwork[] = ((arts ?? []) as RawArtworkRow[]).map((raw) => {
      const storedGenres = genreByArtId.get(raw.id) ?? [];
      const blockchainRecorded = hasBlockchainRecord({
        txHash: raw.tx_hash,
        chain: raw.chain,
        blockNumber: raw.block_number,
        workId: raw.work_id,
      });

      return {
        id: raw.id,
        title: raw.title,
        description: raw.description,
        img: raw.c_secure_url,
        category: storedGenres[0] ?? "Uncategorized",
        uploadDate: formatUploadDate(raw.created_at),
        createdAt: raw.created_at,
        ownershipStatus: mapOwnershipStatus(raw.status, raw.tx_hash),
        hashStatus: mapHashStatus(raw.perceptual_hash),
        color: "from-slate-600 to-slate-800",
        status: raw.status,

        txHash: raw.tx_hash,
        chain: raw.chain,
        workId: raw.work_id,
        blockNumber: raw.block_number,

        hasBlockchainRecord: blockchainRecorded,
        canEdit: canEditArtwork({
          status: raw.status,
          txHash: raw.tx_hash,
          chain: raw.chain,
          blockNumber: raw.block_number,
          workId: raw.work_id,
        }),
        canDelete: canDeleteArtwork({
          status: raw.status,
          txHash: raw.tx_hash,
          chain: raw.chain,
          blockNumber: raw.block_number,
          workId: raw.work_id,
        }),
      };
    });

    return { success: true, artworks };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to fetch artworks.",
    };
  }
}