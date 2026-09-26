"use server";

import { ethers } from "ethers";

/**
 * Authoritative on-chain state for a registered work, read directly from the
 * ArtworkRegistry contract. Used at verification time so the trust decision
 * (and revocation status) can cite the blockchain rather than only the app's
 * own database.
 */
export type OnChainWork = {
    revoked: boolean;
    /** On-chain perceptual hash, packed as a bytes32 hex string. */
    pHash: string;
    fileHash: string;
    revokedAt: number;
};

const RPC = process.env.AMOY_RPC_URL;
const REGISTRY_ADDR =
    process.env.ARTWORK_REGISTRY ??
    "0xfECCacAfd806C5D34355ABB10606F784B946D5c0";

const ABI = [
    "function getWork(uint256 workId) view returns (tuple(bytes32 authorIdHash, address attester, uint64 createdAt, bytes32 fileHash, bytes32 pHash, bytes32 evidenceHash, bool revoked, uint64 revokedAt, bytes32 revokeReasonHash))",
] as const;

const READ_TIMEOUT_MS = 4000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error("on-chain read timed out")), ms),
        ),
    ]);
}

/**
 * Reads a work record from the registry. Returns null on any failure (missing
 * config, RPC error, timeout, unknown workId) so verification degrades
 * gracefully to database state instead of erroring.
 */
export async function readOnChainWork(
    workId: string,
): Promise<OnChainWork | null> {
    if (!RPC || !workId?.trim() || !ethers.isAddress(REGISTRY_ADDR)) {
        return null;
    }

    try {
        const provider = new ethers.JsonRpcProvider(RPC);
        const registry = new ethers.Contract(REGISTRY_ADDR, ABI, provider);

        const work = await withTimeout(
            registry.getWork(workId),
            READ_TIMEOUT_MS,
        );

        return {
            revoked: Boolean(work.revoked),
            pHash: String(work.pHash),
            fileHash: String(work.fileHash),
            revokedAt: Number(work.revokedAt ?? 0),
        };
    } catch {
        return null;
    }
}
