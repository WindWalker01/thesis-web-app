"use server";

import { ethers } from "ethers";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
    VerifyComparisonItem,
    VerifyArtworkResult,
    VerifyArtworkResultData,
    VerifyArtworkStatus,
    VerifiableArtworkItem,
} from "../types";

type RawArtworkRow = {
    id: string;
    owner_id: string;
    title: string;
    description: string | null;
    c_secure_url: string | null;
    created_at: string;
    status: string;
    chain: string | null;
    tx_hash: string | null;
    block_number: number | null;
    work_id: string | null;
    file_hash: string;
    perceptual_hash: string | null;
    author_id_hash: string | null;
    evidence_hash: string | null;
};

const RPC_URL =
    process.env.AMOY_RPC_URL ?? "https://rpc-amoy.polygon.technology/";

const CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_ARTWORK_REGISTRY_CONTRACT_ADDRESS ??
    process.env.ARTWORK_REGISTRY_CONTRACT_ADDRESS ??
    process.env.ARTWORK_REGISTRY ??
    "0xd4e0a7C7c4D846856B2eb97A4A5fc56b01611B4e";

const CHAIN_LABEL = "Polygon Amoy";
const EXPLORER_BASE_URL = "https://amoy.polygonscan.com";

const ABI = [
    "function getWork(uint256 workId) external view returns ((bytes32 authorIdHash,address attester,uint64 createdAt,bytes32 fileHash,bytes32 pHash,bytes32 evidenceHash,bool revoked,uint64 revokedAt,bytes32 revokeReasonHash))",
] as const;

function normalizeHash(value: string | null | undefined): string | null {
    if (!value) return null;
    return value.trim().toLowerCase();
}

function safeBigIntToString(value: bigint | null | undefined): string | null {
    if (value === null || value === undefined) return null;
    return value.toString();
}

function unixToIso(seconds: bigint | number | null | undefined): string | null {
    if (seconds === null || seconds === undefined) return null;
    const numeric = typeof seconds === "bigint" ? Number(seconds) : seconds;
    if (!numeric) return null;
    return new Date(numeric * 1000).toISOString();
}

function compareField(
    key: VerifyComparisonItem["key"],
    label: string,
    expected: string | null,
    actual: string | null,
    note?: string | null
): VerifyComparisonItem {
    return {
        key,
        label,
        expected,
        actual,
        matches: normalizeHash(expected) === normalizeHash(actual),
        note: note ?? null,
    };
}

function compareExact(
    key: VerifyComparisonItem["key"],
    label: string,
    expected: string | null,
    actual: string | null,
    note?: string | null
): VerifyComparisonItem {
    return {
        key,
        label,
        expected,
        actual,
        matches: (expected ?? "") === (actual ?? ""),
        note: note ?? null,
    };
}

function buildSummary(status: VerifyArtworkStatus): string {
    switch (status) {
        case "verified":
            return "The selected artwork matches its stored blockchain ownership record.";
        case "revoked":
            return "The artwork exists on-chain, but the blockchain record has been revoked.";
        case "mismatch":
            return "The artwork has a blockchain record, but one or more ownership values do not match.";
        case "not_recorded":
            return "This artwork does not have a blockchain work ID yet, so ownership cannot be verified on-chain.";
        case "not_found_on_chain":
            return "A work ID exists in the database, but no matching on-chain record could be retrieved.";
        case "incomplete":
            return "This artwork is missing one or more stored ownership hashes required for verification.";
        default:
            return "The system could not verify this artwork right now.";
    }
}

function mapArtwork(row: RawArtworkRow): VerifiableArtworkItem {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        imageUrl: row.c_secure_url,
        createdAt: row.created_at,
        status: row.status,
        chain: row.chain,
        txHash: row.tx_hash,
        blockNumber: row.block_number,
        workId: row.work_id,
        fileHash: row.file_hash,
        perceptualHash: row.perceptual_hash,
        authorIdHash: row.author_id_hash,
        evidenceHash: row.evidence_hash,
    };
}

export async function verifyArtworkOwnership(
    artworkId: string
): Promise<VerifyArtworkResult> {
    try {
        const supabase = await createSupabaseServerClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, message: "You must be signed in to verify artworks." };
        }

        const { data, error } = await supabase
            .from("registered_arts")
            .select(`
                id,
                owner_id,
                title,
                description,
                c_secure_url,
                created_at,
                status,
                chain,
                tx_hash,
                block_number,
                work_id,
                file_hash,
                perceptual_hash,
                author_id_hash,
                evidence_hash
            `)
            .eq("id", artworkId)
            .eq("owner_id", user.id)
            .maybeSingle();

        if (error) {
            return { success: false, message: error.message };
        }

        if (!data) {
            return { success: false, message: "Artwork not found." };
        }

        const artwork = mapArtwork(data as RawArtworkRow);

        if (
            !artwork.fileHash ||
            !artwork.perceptualHash ||
            !artwork.authorIdHash ||
            !artwork.evidenceHash
        ) {
            const incompleteResult: VerifyArtworkResultData = {
                artwork,
                contractAddress: CONTRACT_ADDRESS,
                chainLabel: CHAIN_LABEL,
                explorerBaseUrl: EXPLORER_BASE_URL,
                status: "incomplete",
                summary: buildSummary("incomplete"),
                verifiedAt: new Date().toISOString(),
                onChainWork: null,
                comparisons: [],
            };

            return { success: true, data: incompleteResult };
        }

        if (!artwork.workId) {
            const notRecordedResult: VerifyArtworkResultData = {
                artwork,
                contractAddress: CONTRACT_ADDRESS,
                chainLabel: CHAIN_LABEL,
                explorerBaseUrl: EXPLORER_BASE_URL,
                status: "not_recorded",
                summary: buildSummary("not_recorded"),
                verifiedAt: new Date().toISOString(),
                onChainWork: null,
                comparisons: [],
            };

            return { success: true, data: notRecordedResult };
        }

        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

        let onChainRaw:
            | {
                authorIdHash: string;
                attester: string;
                createdAt: bigint;
                fileHash: string;
                pHash: string;
                evidenceHash: string;
                revoked: boolean;
                revokedAt: bigint;
                revokeReasonHash: string;
            }
            | null = null;

        try {
            const result = await contract.getWork(BigInt(artwork.workId));

            onChainRaw = {
                authorIdHash: result.authorIdHash,
                attester: result.attester,
                createdAt: result.createdAt,
                fileHash: result.fileHash,
                pHash: result.pHash,
                evidenceHash: result.evidenceHash,
                revoked: result.revoked,
                revokedAt: result.revokedAt,
                revokeReasonHash: result.revokeReasonHash,
            };
        } catch {
            const notFoundResult: VerifyArtworkResultData = {
                artwork,
                contractAddress: CONTRACT_ADDRESS,
                chainLabel: CHAIN_LABEL,
                explorerBaseUrl: EXPLORER_BASE_URL,
                status: "not_found_on_chain",
                summary: buildSummary("not_found_on_chain"),
                verifiedAt: new Date().toISOString(),
                onChainWork: null,
                comparisons: [],
            };

            return { success: true, data: notFoundResult };
        }

        const onChainWork = {
            workId: artwork.workId,
            authorIdHash: onChainRaw.authorIdHash,
            attester: onChainRaw.attester,
            createdAt: unixToIso(onChainRaw.createdAt) ?? new Date().toISOString(),
            fileHash: onChainRaw.fileHash,
            pHash: onChainRaw.pHash,
            evidenceHash: onChainRaw.evidenceHash,
            revoked: onChainRaw.revoked,
            revokedAt: unixToIso(onChainRaw.revokedAt),
            revokeReasonHash:
                normalizeHash(onChainRaw.revokeReasonHash) ===
                    normalizeHash(ethers.ZeroHash)
                    ? null
                    : onChainRaw.revokeReasonHash,
        };

        const comparisons: VerifyComparisonItem[] = [
            compareExact(
                "work_id",
                "Work ID",
                artwork.workId,
                onChainWork.workId,
                "The database work ID should point to the same blockchain record."
            ),
            compareField(
                "file_hash",
                "File hash",
                artwork.fileHash,
                onChainWork.fileHash,
                "Matches the exact artwork fingerprint recorded on-chain."
            ),
            compareField(
                "perceptual_hash",
                "Perceptual hash",
                artwork.perceptualHash,
                onChainWork.pHash,
                "Checks whether the stored pHash matches the blockchain proof."
            ),
            compareField(
                "author_id_hash",
                "Author ID hash",
                artwork.authorIdHash,
                onChainWork.authorIdHash,
                "Confirms the artwork is tied to the same internal author identity."
            ),
            compareField(
                "evidence_hash",
                "Evidence hash",
                artwork.evidenceHash,
                onChainWork.evidenceHash,
                "Confirms the evidence bundle has not changed."
            ),
            compareExact(
                "revocation_status",
                "Revocation status",
                "active",
                onChainWork.revoked ? "revoked" : "active",
                "A revoked on-chain record should not be treated as fully verified."
            ),
        ];

        const allMatched = comparisons.every((item) => item.matches);
        const status: VerifyArtworkStatus = onChainWork.revoked
            ? "revoked"
            : allMatched
                ? "verified"
                : "mismatch";

        return {
            success: true,
            data: {
                artwork,
                contractAddress: CONTRACT_ADDRESS,
                chainLabel: CHAIN_LABEL,
                explorerBaseUrl: EXPLORER_BASE_URL,
                status,
                summary: buildSummary(status),
                verifiedAt: new Date().toISOString(),
                onChainWork,
                comparisons,
            },
        };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to verify artwork ownership.",
        };
    }
}