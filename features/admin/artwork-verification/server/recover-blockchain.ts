"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { recordArtworkOnBlockchain } from "@/features/(user)/upload-artwork/server/record-artwork-blockchain";
import { isAdminUser } from "@/lib/account-status";

type RecoverBlockchainResult =
  | { success: true; txHash: string; workId: string; chain: string; blockNumber: number | null }
  | { success: false; message: string };

export async function recoverBlockchainForArtwork(
  artworkId: string
): Promise<RecoverBlockchainResult> {
  try {
    const supabase = await createSupabaseServerClient();

    // Verify the caller is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, message: "Not authenticated." };
    }

    // Verify the caller is an admin
    const admin = await isAdminUser(user.id);
    if (!admin) {
      return { success: false, message: "Only admins can perform blockchain recovery." };
    }

    // Fetch the artwork record
    const { data: artwork, error: fetchError } = await supabase
      .from("registered_arts")
      .select(
        `
        id,
        owner_id,
        author_id_hash,
        file_hash,
        perceptual_hash,
        evidence_hash,
        chain,
        tx_hash,
        block_number,
        work_id,
        status
      `
      )
      .eq("id", artworkId)
      .single();

    if (fetchError || !artwork) {
      return { success: false, message: "Artwork record not found." };
    }

    // Skip if already registered on blockchain
    if (artwork.tx_hash && artwork.status === "active") {
      return { success: false, message: "Artwork is already registered on the blockchain." };
    }

    // Validate that required hashes exist
    if (!artwork.author_id_hash || !artwork.file_hash || !artwork.perceptual_hash || !artwork.evidence_hash) {
      return { success: false, message: "Missing blockchain hashes. The artwork may not have been fully processed." };
    }

    // Call the fixed recordArtworkOnBlockchain function
    const result = await recordArtworkOnBlockchain({
      artworkId: artwork.id,
      authorIdHash: artwork.author_id_hash as `0x${string}`,
      fileHash: artwork.file_hash as `0x${string}`,
      perceptualHash: artwork.perceptual_hash as `0x${string}`,
      evidenceHash: artwork.evidence_hash as `0x${string}`,
    });

    if (!result.success) {
      return { success: false, message: result.message };
    }

    return {
      success: true,
      txHash: result.txHash,
      workId: result.workId,
      chain: result.chain,
      blockNumber: result.blockNumber,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Blockchain recovery failed.",
    };
  }
}