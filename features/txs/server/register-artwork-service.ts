// ============================================
// Shared Blockchain Registration Service
// ============================================
// Context-independent service that can be called from:
//   - User upload flow (recordArtworkOnBlockchain)
//   - Admin approval flow (approveArtwork)
//   - Admin recovery flow (recoverBlockchainForArtwork)
//   - User retry flow (retryArtworkOnBlockchain)
//
// Uses the admin/service-role client so it does NOT depend on:
//   - Request cookies
//   - Session authentication
//   - requireActiveAccount()
// ============================================

import { ethers } from "ethers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// ── Configuration ──

const RPC = process.env.AMOY_RPC_URL!;
const PK = process.env.SYSTEM_PRIVATE_KEY!;
const REGISTRY_ADDR =
  process.env.ARTWORK_REGISTRY ?? "0xfECCacAfd806C5D34355ABB10606F784B946D5c0";
const CHAIN_NAME = "amoy";

const ABI = [
  "function registerWorkForUser(bytes32,bytes32,bytes32,bytes32) returns (uint256)",
  "event WorkRegistered(uint256 indexed workId, bytes32 indexed authorIdHash, address indexed attester, bytes32 fileHash, bytes32 pHash, bytes32 evidenceHash)",
] as const;

// ── Types ──

export type RegisterArtworkInput = {
  artworkId: string;
  ownerId: string;
  authorIdHash: `0x${string}`;
  fileHash: `0x${string}`;
  perceptualHash: `0x${string}`;
  evidenceHash: `0x${string}`;
};

export type RegisterArtworkResult =
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

// ── Service ──

export async function registerArtworkOnBlockchain(
  input: RegisterArtworkInput
): Promise<RegisterArtworkResult> {
  const { artworkId, ownerId, authorIdHash, fileHash, perceptualHash, evidenceHash } = input;

  // ── Validate configuration ──
  if (!RPC) {
    return { success: false, message: "AMOY_RPC_URL is not configured." };
  }
  if (!PK) {
    return { success: false, message: "SYSTEM_PRIVATE_KEY is not configured." };
  }
  if (!ethers.isAddress(REGISTRY_ADDR)) {
    return { success: false, message: "ARTWORK_REGISTRY contract address is invalid." };
  }

  // ── Validate input ──
  if (!artworkId) {
    return { success: false, message: "artworkId is required." };
  }
  if (!ownerId) {
    return { success: false, message: "ownerId is required." };
  }

  const supabase = createSupabaseAdminClient();

  // ── Idempotency check: skip if already registered ──
  const { data: existing } = await supabase
    .from("registered_arts")
    .select("tx_hash, work_id, status")
    .eq("id", artworkId)
    .single();

  if (!existing) {
    return { success: false, message: "Artwork record not found." };
  }

  if (existing.tx_hash || existing.work_id) {
    // Already has blockchain data — treat as success to prevent duplicate transactions
    return {
      success: true,
      txHash: existing.tx_hash ?? "",
      blockNumber: null,
      chain: existing.status === "active" ? CHAIN_NAME : "",
      workId: existing.work_id ?? "",
    };
  }

  if (existing.status === "active") {
    return { success: false, message: "Artwork is already active on the blockchain." };
  }

  // ── Submit blockchain transaction ──
  try {
    const provider = new ethers.JsonRpcProvider(RPC);
    const wallet = new ethers.Wallet(PK, provider);
    const registry = new ethers.Contract(REGISTRY_ADDR, ABI, wallet);

    const estGas: bigint = await registry.registerWorkForUser.estimateGas(
      authorIdHash,
      fileHash,
      perceptualHash,
      evidenceHash,
    );

    const gasLimit = (estGas * BigInt(120)) / BigInt(100);

    const tx = await registry.registerWorkForUser(
      authorIdHash,
      fileHash,
      perceptualHash,
      evidenceHash,
      { gasLimit },
    );

    const receipt = await tx.wait(2);

    if (!receipt) {
      await supabase
        .from("registered_arts")
        .update({ status: "blockchain_failed" })
        .eq("id", artworkId);

      return { success: false, message: "Transaction was dropped — no receipt received." };
    }

    // ── Parse WorkRegistered event ──
    const iface = new ethers.Interface(ABI);
    let workId: bigint | null = null;

    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== REGISTRY_ADDR.toLowerCase()) continue;

      try {
        const parsed = iface.parseLog(log);
        if (parsed?.name === "WorkRegistered") {
          workId = parsed.args.workId as bigint;
          break;
        }
      } catch {
        // ignore unrelated logs
      }
    }

    if (workId === null) {
      await supabase
        .from("registered_arts")
        .update({ status: "blockchain_failed" })
        .eq("id", artworkId);

      return { success: false, message: "WorkRegistered event not found in transaction logs." };
    }

    // ── Persist blockchain data ──
    const { error: updateError } = await supabase
      .from("registered_arts")
      .update({
        chain: CHAIN_NAME,
        tx_hash: receipt.hash,
        block_number: receipt.blockNumber,
        work_id: workId.toString(),
        status: "active",
      })
      .eq("id", artworkId)
      .eq("owner_id", ownerId);

    if (updateError) {
      // Transaction succeeded on-chain but DB update failed.
      // Retry the update once to prevent double-minting on re-invocation.
      const { error: retryError } = await supabase
        .from("registered_arts")
        .update({
          chain: CHAIN_NAME,
          tx_hash: receipt.hash,
          block_number: receipt.blockNumber,
          work_id: workId.toString(),
          status: "active",
        })
        .eq("id", artworkId)
        .eq("owner_id", ownerId);

      if (retryError) {
        // DB update still failed — return error but the idempotency check
        // won't help since tx_hash wasn't persisted. Log and return failure.
        console.error(
          `[registerArtworkOnBlockchain] CRITICAL: DB update failed after confirmed tx ${receipt.hash} for artwork ${artworkId}. Retry also failed: ${retryError.message}`,
        );
        return {
          success: false,
          message: `Blockchain transaction succeeded (${receipt.hash}) but database update failed after retry: ${retryError.message}. An admin must manually sync this record.`,
        };
      }
    }

    return {
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber ?? null,
      chain: CHAIN_NAME,
      workId: workId.toString(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Blockchain registration failed.";

    // Mark as failed so it can be retried
    await supabase
      .from("registered_arts")
      .update({ status: "blockchain_failed" })
      .eq("id", artworkId);

    return { success: false, message };
  }
}

// ── Notification helpers ──

export async function createBlockchainSuccessNotification(
  artworkId: string,
  ownerId: string,
  artworkTitle: string,
  txHash: string,
  workId: string,
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await supabase.from("notifications").insert({
    user_id: ownerId,
    type: "blockchain_recorded",
    title: "Artwork Registered on Blockchain",
    message: `Your artwork "${artworkTitle}" has been successfully registered on the blockchain. Transaction: ${txHash}`,
    related_art_id: artworkId,
    action_url: `/profile/artworks/${artworkId}`,
    metadata: { tx_hash: txHash, work_id: workId },
  });
}

export async function createBlockchainFailureNotification(
  artworkId: string,
  ownerId: string,
  artworkTitle: string,
  errorMessage: string,
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await supabase.from("notifications").insert({
    user_id: ownerId,
    type: "system_announcement",
    title: "Blockchain Registration Failed",
    message: `Blockchain registration for "${artworkTitle}" failed: ${errorMessage}. An administrator may retry the registration.`,
    related_art_id: artworkId,
    action_url: `/profile/artworks/${artworkId}`,
    metadata: { error: errorMessage },
  });
}