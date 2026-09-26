"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireActiveAccount, isAdminUser } from "@/lib/account-status";
import {
  registerArtworkOnBlockchain as sharedRegisterArtwork,
} from "@/features/txs/server/register-artwork-service";

type RecordArtworkOnBlockchainInput = {
  artworkId: string;
  authorIdHash: `0x${string}`;
  fileHash: `0x${string}`;
  perceptualHash: `0x${string}`;
  evidenceHash: `0x${string}`;
};

type RecordArtworkOnBlockchainResult =
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
 * User-facing server action to register an artwork on the blockchain.
 * Verifies authentication and ownership, then delegates to the shared service.
 */
export async function recordArtworkOnBlockchain(
  input: RecordArtworkOnBlockchainInput
): Promise<RecordArtworkOnBlockchainResult> {
  try {
    const supabase = await createSupabaseServerClient();

    // Verify account is active (admins bypass suspension/banned checks)
    let userId: string;
    try {
      userId = await requireActiveAccount();
    } catch {
      return { success: false, message: "Your account is currently suspended or banned. You cannot register artwork on the blockchain." };
    }

    const { artworkId, authorIdHash, fileHash, perceptualHash, evidenceHash } = input;

    if (!artworkId) {
      return { success: false, message: "artworkId is required." };
    }

    // Look up the artwork's actual owner from the database
    const { data: artworkRecord, error: lookupError } = await supabase
      .from("registered_arts")
      .select("owner_id")
      .eq("id", artworkId)
      .single();

    if (lookupError || !artworkRecord) {
      return { success: false, message: "Artwork record not found." };
    }

    const actualOwnerId = artworkRecord.owner_id;

    // Verify authorization: caller must be the artwork owner OR an admin
    const isAdmin = await isAdminUser(userId);
    if (!isAdmin && userId !== actualOwnerId) {
      return { success: false, message: "You are not authorized to register this artwork on the blockchain." };
    }

    // Delegate to the context-independent shared service
    return await sharedRegisterArtwork({
      artworkId,
      ownerId: actualOwnerId,
      authorIdHash,
      fileHash,
      perceptualHash,
      evidenceHash,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Blockchain recording failed.";

    return {
      success: false,
      message,
    };
  }
}
