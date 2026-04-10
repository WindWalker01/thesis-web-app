import crypto from "node:crypto";
import { ArtworkStatus } from "./types";

/**
 * Generates a deterministic SHA-256 digest for the raw uploaded file bytes.
 *
 * This is stored inside the evidence payload as a conventional integrity checksum.
 * It is separate from the Ethereum keccak256 values used elsewhere for blockchain
 * compatibility and registry hashing.
 */
export function sha256Hex(buf: Buffer): string {
    return crypto.createHash("sha256").update(buf).digest("hex");
}

/**
 * Normalizes a perceptual hash into a bytes32-compatible hex string.
 *
 * The plagiarism service returns a compact perceptual hash (often 64-bit / 16 hex chars),
 * but the smart contract expects bytes32. We therefore:
 * 1. remove any 0x prefix
 * 2. validate that the value is hexadecimal
 * 3. left-pad it to 32 bytes (64 hex chars)
 *
 * This allows the same stored value to be reused directly in the blockchain step.
 */
export function normalizePerceptualHashToBytes32(value: string): `0x${string}` {
    const cleaned = value.trim().toLowerCase().replace(/^0x/, "");

    if (!/^[0-9a-f]+$/.test(cleaned)) {
        throw new Error("Perceptual hash must be hexadecimal.");
    }

    if (cleaned.length > 64) {
        throw new Error("Perceptual hash is too long for bytes32.");
    }

    return `0x${cleaned.padStart(64, "0")}` as `0x${string}`;
}

/**
 * Produces a stable JSON string regardless of key insertion order.
 *
 * This is important because evidenceHash must be deterministic:
 * the same logical evidence object must always produce the same keccak256 result,
 * even if object property order differs at runtime.
 */
export function stableStringify(obj: unknown): string {
    if (obj === null || typeof obj !== "object") {
        return JSON.stringify(obj);
    }

    if (Array.isArray(obj)) {
        return `[${obj.map(stableStringify).join(",")}]`;
    }

    const record = obj as Record<string, unknown>;
    const keys = Object.keys(record).sort();

    return `{${keys
        .map((key) => JSON.stringify(key) + ":" + stableStringify(record[key]))
        .join(",")}}`;
}

/**
 * Centralizes the moderation decision derived from the similarity score.
 *
 * This function acts as the policy boundary for the upload workflow:
 * - >= 87.5  => flagged
 * - >= 75    => under_review
 * - < 75     => safe to continue toward blockchain preparation
 *
 * We also return shouldClassify so downstream logic does not need to duplicate
 * threshold rules elsewhere in the pipeline.
 */
export function getArtworkStatusFromSimilarity(similarity: number): {
    artworkStatus: ArtworkStatus;
    moderationMessage: string;
    shouldClassify: boolean;
} {
    if (similarity >= 87.5) {
        return {
            artworkStatus: "flagged",
            moderationMessage:
                "High similarity detected. Your artwork was submitted and flagged for admin review.",
            shouldClassify: false,
        };
    }

    if (similarity >= 75) {
        return {
            artworkStatus: "under_review",
            moderationMessage:
                "Moderate similarity detected. Your artwork was submitted for review.",
            shouldClassify: true,
        };
    }

    return {
        artworkStatus: "pending_blockchain",
        moderationMessage:
            "Artwork uploaded successfully and is ready for protection.",
        shouldClassify: true,
    };
}