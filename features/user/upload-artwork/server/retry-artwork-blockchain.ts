"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  registerArtworkOnBlockchain as sharedRegisterArtwork,
} from "@/features/txs/server/register-artwork-service";

type RetryArtworkOnBlockchainInput = {
  artworkId: string;
};

type RetryArtworkOnBlockchainResult =
  | {
      success: true;
      txHash: string;
      blockNumber: number | null;
      chain: string;
      workId: string;
    }
  | {
      success: false;
      message: string;
    };

/**
 * User-facing retry server action.
 * Verifies the user owns the artwork and that it is in a retryable state,
 * then delegates to the shared blockchain service.
 */
export async function retryArtworkOnBlockchain(
  input: RetryArtworkOnBlockchainInput,
): Promise<RetryArtworkOnBlockchainResult> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "You must be logged in." };
    }

    const { artworkId } = input;

    if (!artworkId) {
      return { success: false, message: "artworkId is required." };
    }

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
        status
      `,
      )
      .eq("id", artworkId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (fetchError) {
      return { success: false, message: fetchError.message };
    }

    if (!artwork) {
      return { success: false, message: "Artwork record not found." };
    }

    if (!["pending_blockchain", "blockchain_failed"].includes(artwork.status)) {
      return {
        success: false,
        message: "This artwork is not in a retryable blockchain state.",
      };
    }

    if (
      !artwork.author_id_hash ||
      !artwork.file_hash ||
      !artwork.perceptual_hash ||
      !artwork.evidence_hash
    ) {
      return {
        success: false,
        message: "Missing stored blockchain hashes for retry.",
      };
    }

    // Delegate to the context-independent shared service
    return await sharedRegisterArtwork({
      artworkId,
      ownerId: user.id,
      authorIdHash: artwork.author_id_hash as `0x${string}`,
      fileHash: artwork.file_hash as `0x${string}`,
      perceptualHash: artwork.perceptual_hash as `0x${string}`,
      evidenceHash: artwork.evidence_hash as `0x${string}`,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Blockchain retry failed.";

    return {
      success: false,
      message,
    };
  }
}
