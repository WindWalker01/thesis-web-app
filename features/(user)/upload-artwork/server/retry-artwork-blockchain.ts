"use server";

import { ethers } from "ethers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

const RPC = process.env.AMOY_RPC_URL!;
const PK = process.env.SYSTEM_PRIVATE_KEY!;
const REGISTRY_ADDR =
    process.env.ARTWORK_REGISTRY ?? "0xd4e0a7C7c4D846856B2eb97A4A5fc56b01611B4e";

const CHAIN_NAME = "amoy";

const ABI = [
    "function registerWorkForUser(bytes32,bytes32,bytes32,bytes32) returns (uint256)",
    "event WorkRegistered(uint256 indexed workId, bytes32 indexed authorIdHash, address indexed attester, bytes32 fileHash, bytes32 pHash, bytes32 evidenceHash)",
] as const;

export async function retryArtworkOnBlockchain(
    input: RetryArtworkOnBlockchainInput
): Promise<RetryArtworkOnBlockchainResult> {
    let supabase: Awaited<ReturnType<typeof createSupabaseServerClient>> | null = null;

    try {
        if (!RPC) {
            return { success: false, message: "AMOY_RPC_URL missing." };
        }

        if (!PK) {
            return { success: false, message: "SYSTEM_PRIVATE_KEY missing." };
        }

        if (!ethers.isAddress(REGISTRY_ADDR)) {
            return { success: false, message: "Bad ARTWORK_REGISTRY address." };
        }

        supabase = await createSupabaseServerClient();

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
            .select(`
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
      `)
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

        if (artwork.tx_hash || artwork.work_id) {
            return {
                success: false,
                message: "This artwork already appears to be registered on-chain.",
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

        const provider = new ethers.JsonRpcProvider(RPC);
        const wallet = new ethers.Wallet(PK, provider);
        const registry = new ethers.Contract(REGISTRY_ADDR, ABI, wallet);

        const estGas: bigint = await registry.registerWorkForUser.estimateGas(
            artwork.author_id_hash,
            artwork.file_hash,
            artwork.perceptual_hash,
            artwork.evidence_hash
        );

        const gasLimit = (estGas * BigInt(120)) / BigInt(100);

        const tx = await registry.registerWorkForUser(
            artwork.author_id_hash,
            artwork.file_hash,
            artwork.perceptual_hash,
            artwork.evidence_hash,
            { gasLimit }
        );

        const receipt = await tx.wait(2);

        if (!receipt) {
            await supabase
                .from("registered_arts")
                .update({ status: "blockchain_failed" })
                .eq("id", artworkId)
                .eq("owner_id", user.id);

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
                .eq("id", artworkId)
                .eq("owner_id", user.id);

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
            .eq("owner_id", user.id);

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
            error instanceof Error
                ? error.message
                : "Blockchain retry failed.";

        if (supabase && input.artworkId) {
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (user) {
                    await supabase
                        .from("registered_arts")
                        .update({ status: "blockchain_failed" })
                        .eq("id", input.artworkId)
                        .eq("owner_id", user.id);
                }
            } catch {
                // ignore secondary failure
            }
        }

        return {
            success: false,
            message,
        };
    }
}