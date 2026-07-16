"use server";

import { ethers } from "ethers";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireActiveAccount, isAdminUser } from "@/lib/account-status";

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

const RPC = process.env.AMOY_RPC_URL!;
const PK = process.env.SYSTEM_PRIVATE_KEY!;
const REGISTRY_ADDR =
  process.env.ARTWORK_REGISTRY ?? "0xfECCacAfd806C5D34355ABB10606F784B946D5c0";

const CHAIN_NAME = "amoy";

const ABI = [
  "function registerWorkForUser(bytes32,bytes32,bytes32,bytes32) returns (uint256)",
  "event WorkRegistered(uint256 indexed workId, bytes32 indexed authorIdHash, address indexed attester, bytes32 fileHash, bytes32 pHash, bytes32 evidenceHash)",
] as const;

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

    if (!ethers.isAddress(REGISTRY_ADDR)) {
      return { success: false, message: "Bad ARTWORK_REGISTRY address." };
    }

    const { artworkId, authorIdHash, fileHash, perceptualHash, evidenceHash } =
      input;

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

      return { success: false, message: "No receipt (dropped tx?)." };
    }

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

      return { success: false, message: "WorkRegistered event not found." };
    }

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
      .eq("owner_id", actualOwnerId);

    if (updateError) {
      return { success: false, message: updateError.message };
    }

    return {
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber ?? null,
      chain: CHAIN_NAME,
      workId: workId.toString(),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Blockchain recording failed.";

    return {
      success: false,
      message,
    };
  }
}