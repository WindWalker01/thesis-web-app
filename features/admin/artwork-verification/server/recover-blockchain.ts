"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/account-status";
import {
  registerArtworkOnBlockchain as sharedRegisterArtwork,
} from "@/features/txs/server/register-artwork-service";

type RecoverBlockchainResult =
  | { success: true; txHash: string; workId: string; chain: string; blockNumber: number | null }
  | { success: false; message: string };

/**
 * Admin-only recovery action.
 * Verifies admin authorization, then delegates to the shared blockchain service.
 */
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

    // Fetch the artwork record (use admin client to bypass RLS)
    const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
    const adminSupabase = createSupabaseAdminClient();

    const { data: artwork, error: fetchError } = await adminSupabase
      .from("registered_arts")
      .select(
        `
        id,
        owner_id,
        author_id_hash,
        file_hash,
        perceptual_hash,
        evidence_hash,
        status
      `
      )
      .eq("id", artworkId)
      .single();

    if (fetchError || !artwork) {
      return { success: false, message: "Artwork record not found." };
    }

    // Validate that required hashes exist
    if (!artwork.author_id_hash || !artwork.file_hash || !artwork.perceptual_hash || !artwork.evidence_hash) {
      return { success: false, message: "Missing blockchain hashes. The artwork may not have been fully processed." };
    }

    // Delegate to the context-independent shared service
    const result = await sharedRegisterArtwork({
      artworkId: artwork.id,
      ownerId: artwork.owner_id,
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
