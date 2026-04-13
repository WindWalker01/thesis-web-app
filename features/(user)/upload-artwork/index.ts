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
 * Centralizes the moderation decision derived from the similarity score and match source.
 *
 * Policy rules (evaluated top-to-bottom, first match wins):
 *
 *  1. 100% database match       → hard-blocked upstream, never reaches this function.
 *
 *  2. 100% internet match       → under_review, no blockchain.
 *     We cannot trust an internet result as authoritative proof of duplication, so
 *     we hold it for admin review rather than blocking or approving outright.
 *
 *  3. 87.5 – 99.99% (any src)  → flagged, no genre classification.
 *     High enough to warrant admin attention regardless of source.
 *
 *  4. 75 – 87.49% (any src)    → under_review, genre classified, pending blockchain.
 *     Moderate risk; genre tagging helps admins assess context.
 *
 *  5. < 75%, database source   → pending_blockchain, genre classified.
 *     Low similarity from a trusted source — safe to proceed to chain registration.
 *
 *  6. < 75%, internet source   → under_review, genre classified, pending blockchain.
 *     Low similarity but internet provenance is untrusted; hold for confirmation.
 *
 * We also return shouldClassify so downstream logic does not need to duplicate
 * threshold rules elsewhere in the pipeline.
 */
export function getArtworkStatusFromSimilarity(
    similarity: number,
    source: "database" | "internet" | null,
): {
    artworkStatus: ArtworkStatus;
    moderationMessage: string;
    shouldClassify: boolean;
} {
    // Rule 2: exact internet match — hold for review, do not auto-block
    if (similarity >= 100 && source === "internet") {
        return {
            artworkStatus: "under_review",
            moderationMessage:
                "An exact internet match was detected. Your artwork has been submitted for admin review.",
            shouldClassify: true,
        };
    }

    // Rule 3: high similarity from any source — flag for admin
    if (similarity >= 87.5) {
        return {
            artworkStatus: "flagged",
            moderationMessage:
                "High similarity detected. Your artwork was submitted and flagged for admin review.",
            shouldClassify: false,
        };
    }

    // Rule 4: moderate similarity from any source — review + genre
    if (similarity >= 75) {
        return {
            artworkStatus: "under_review",
            moderationMessage:
                "Moderate similarity detected. Your artwork was submitted for review.",
            shouldClassify: true,
        };
    }

    // Rules 5 & 6: low similarity — split on source trustworthiness
    if (source === "internet") {
        return {
            artworkStatus: "under_review",
            moderationMessage:
                "Your artwork has been submitted. Because the similarity match came from an internet source, it is pending review before blockchain registration.",
            shouldClassify: true,
        };
    }

    // Rule 5: low similarity from database (trusted) — ready for chain
    return {
        artworkStatus: "pending_blockchain",
        moderationMessage:
            "Artwork uploaded successfully and is ready for protection.",
        shouldClassify: true,
    };
}