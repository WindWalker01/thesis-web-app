"use server";

import { z } from "zod";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/server-utils";
import { readOnChainWork } from "./read-onchain-work";
import type {
    CertificateVerificationResult,
    PublicCertificateVerification,
} from "../types";

const POLYGONSCAN_BASE = "https://amoy.polygonscan.com/tx";

const uuidSchema = z.string().uuid();

type RegisteredArtRow = {
    id: string;
    owner_id: string;
    title: string;
    c_secure_url: string | null;
    perceptual_hash: string | null;
    work_id: string | null;
    created_at: string;
    status: string;
    chain: string | null;
    tx_hash: string | null;
};

/**
 * Looks up a certificate by artwork UUID and returns a whitelisted verification
 * payload. Uses the service-role admin client to bypass RLS, but the API itself
 * acts as the gatekeeper: private artwork details are returned only when the
 * signed-in user is the artwork owner.
 */
export async function verifyCertificate(
    rawId: string,
): Promise<CertificateVerificationResult> {
    const parsed = uuidSchema.safeParse(rawId);
    if (!parsed.success) {
        return { found: false, reason: "invalid_id" };
    }

    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
        .from("registered_arts")
        .select(
            `
                id,
                owner_id,
                title,
                c_secure_url,
                perceptual_hash,
                work_id,
                created_at,
                status,
                chain,
                tx_hash
            `,
        )
        .eq("id", parsed.data)
        .maybeSingle<RegisteredArtRow>();

    if (error || !data) {
        return { found: false, reason: "not_found" };
    }

    const txHash = data.tx_hash?.trim() ? data.tx_hash : null;
    const dbPHash = data.perceptual_hash?.trim() ? data.perceptual_hash : null;

    // Authoritative on-chain read: surfaces the contract's `revoked` flag and
    // confirms the perceptual fingerprint anchored on-chain matches our record.
    // Degrades gracefully to database state if the chain is unreachable.
    const onChain = data.work_id?.trim()
        ? await readOnChainWork(data.work_id)
        : null;

    const revoked = onChain?.revoked ?? false;
    const onChainVerified =
        onChain !== null &&
        dbPHash !== null &&
        onChain.pHash.toLowerCase() === dbPHash.toLowerCase();

    const registered = data.status === "active" && txHash !== null;
    const valid = registered && !revoked;

    const certificateStatus: PublicCertificateVerification["certificateStatus"] =
        revoked ? "Revoked" : valid ? "Valid" : "Pending";

    const publicPayload: PublicCertificateVerification = {
        valid,
        revoked,
        onChainVerified,
        certificateStatus,
        artworkRegistration: registered ? "Confirmed" : "Pending",
        ownershipStatus: valid ? "Verified" : "Pending",
        artworkTitle: data.title,
        artworkImage: data.c_secure_url,
        perceptualHash: dbPHash,
        workId: data.work_id?.trim() ? data.work_id : null,
        blockchain: data.chain?.trim() ? data.chain : "N/A",
        transactionHash: txHash,
        polygonScanUrl: txHash ? `${POLYGONSCAN_BASE}/${txHash}` : null,
        issuedAt: data.created_at,
        isOwner: false,
    };

    const user = await getAuthUser();

    if (!user || user.id !== data.owner_id) {
        return { found: true, data: publicPayload };
    }

    const { data: owner } = await supabase
        .from("users")
        .select("first_name, middle_name, last_name, username")
        .eq("id", data.owner_id)
        .maybeSingle<{
            first_name: string;
            middle_name: string | null;
            last_name: string;
            username: string;
        }>();

    const artistName = owner
        ? [owner.first_name, owner.middle_name, owner.last_name]
              .filter((part) => !!part && part.trim().length > 0)
              .join(" ")
        : "";

    return {
        found: true,
        data: {
            ...publicPayload,
            isOwner: true,
            artistName: artistName || "N/A",
            artistUsername: owner?.username ?? "N/A",
            registrationDate: data.created_at,
        },
    };
}
