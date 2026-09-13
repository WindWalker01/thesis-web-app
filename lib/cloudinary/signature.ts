"use server";

import crypto from "node:crypto";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CloudinarySignatureResult } from "./types";

/**
 * Folders the signature action may sign for. Keeps the signed-upload surface
 * scoped to known buckets instead of an open upload proxy.
 */
const ALLOWED_FOLDERS = [
  "registered-arts",
  "profile-images",
  "review-evidence",
] as const;

/**
 * Server action: issues a signed Cloudinary direct-upload payload so the
 * browser can upload files straight to Cloudinary.
 *
 * This is what makes large-file uploads possible on serverless hosts: the
 * raw file bytes never travel through the Next.js server, whose request body
 * is hard-capped by the platform (e.g. Vercel's 4.5 MB
 * `FUNCTION_PAYLOAD_TOO_LARGE`). The signature request carries only metadata.
 *
 * The signature covers exactly `{ folder, timestamp }` — the client must send
 * precisely these params plus `api_key`, `signature` and `file`.
 */
export async function getCloudinaryUploadSignature(
  folder: string,
): Promise<CloudinarySignatureResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Authentication required." };
    }

    if (!(ALLOWED_FOLDERS as readonly string[]).includes(folder)) {
      return { success: false, message: "Unsupported upload destination." };
    }

    const cloudName = process.env.CLOUDINARY_NAME;
    const apiKey = process.env.CLOUDINARY_KEY;
    const apiSecret = process.env.CLOUDINARY_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return {
        success: false,
        message: "Storage upload is not configured in the environment.",
      };
    }

    // Cloudinary signature: SHA-1 of the sorted `key=value` params joined by
    // `&`, with the API secret appended.
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHash("sha1")
      .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
      .digest("hex");

    return { success: true, apiKey, timestamp, signature, cloudName, folder };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Failed to sign the upload.",
    };
  }
}
