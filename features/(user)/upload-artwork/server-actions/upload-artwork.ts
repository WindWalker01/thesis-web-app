"use server";

import crypto from "node:crypto";
import { ethers } from "ethers";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formSchema } from "@/features/(user)/upload-artwork/schemas/artwork-schema";
import { uploadArtworkImageToCloudinary } from "@/features/(user)/upload-artwork/server-actions/upload-image";
// import { generatePHash } from "@/lib/image-investigator";

type RecordArtworkInDatabaseResult =
  | {
    success: true;
    artworkId: string;
    fileHash: `0x${string}`;
    perceptualHash: `0x${string}`;
    authorIdHash: `0x${string}`;
    evidenceHash: `0x${string}`;
    imageUrl: string | null;
  }
  | {
    success: false;
    message: string;
  };

function sha256Hex(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function stableStringify(obj: unknown): string {
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

function pHashBinaryToBytes32(ph: string): `0x${string}` {
  if (!/^[01]{64}$/.test(ph)) {
    return ("0x" + "00".repeat(32)) as `0x${string}`;
  }

  const asBigInt = BigInt("0b" + ph);
  const hex16 = asBigInt.toString(16).padStart(16, "0");
  const bytes32hex = "0x" + "00".repeat(24) + hex16;

  return bytes32hex as `0x${string}`;
}

async function generatePerceptualHashBytes32(_bytes: Buffer): Promise<`0x${string}`> {
  // TODO: replace this placeholder with your real pHash generator
  // const phashBinary = await generatePHash(_bytes);
  const phashBinary = "0".repeat(64);

  return pHashBinaryToBytes32(phashBinary);
}

export async function recordArtworkInDatabase(
  formData: FormData
): Promise<RecordArtworkInDatabaseResult> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "You must be logged in." };
    }

    const title = formData.get("title");
    const description = formData.get("description");
    const rightsConfirmed = formData.get("rightsConfirmed") === "true";
    const file = formData.get("file");

    const parsed = formSchema.safeParse({
      title,
      description,
      rightsConfirmed,
      file,
    });

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return {
        success: false,
        message: firstIssue?.message ?? "Invalid form submission.",
      };
    }

    const validFile = parsed.data.file;
    const arrayBuffer = await validFile.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Compute hashes ONCE here
    const authorIdHash = ethers.keccak256(
      ethers.toUtf8Bytes(user.id)
    ) as `0x${string}`;

    const fileHash = ethers.keccak256(fileBuffer) as `0x${string}`;

    /**
     * TEAMMATE INTEGRATION POINT: pHash generation
     *
     * Replace the placeholder implementation inside generatePerceptualHashBytes32()
     * with your actual pHash generator or external API call.
     *
     * Expected output:
     * - 64-bit binary pHash string from your module/API
     * - converted into bytes32 using pHashBinaryToBytes32()
     */
    const perceptualHash = await generatePerceptualHashBytes32(fileBuffer);

    const evidence = {
      v: 1,
      internalUserIdHash: authorIdHash,
      filename: validFile.name,
      mime: validFile.type,
      size: fileBuffer.length,
      sha256: "0x" + sha256Hex(fileBuffer),
      phashAlgo: "sharp-phash",
      phash: perceptualHash,
      uploadedAt: new Date().toISOString(),
    };

    const evidenceHash = ethers.keccak256(
      ethers.toUtf8Bytes(stableStringify(evidence))
    ) as `0x${string}`;

    /**
     * TEAMMATE INTEGRATION POINT: duplicate / plagiarism checking
     *
     * This is where the external duplicate-check module should run:
     * 1. Compare pHash against database records using Hamming distance threshold
     * 2. Check internet / external plagiarism source
     * 3. If duplicate exists, return:
     *    { success: false, message: "Copyrighted/Duplicate detected." }
     * 4. If unique, continue to registration flow
     *
     */

    /**
     * TEMPORARY exact-match fallback check only.
     * Replace or supplement this with teammate's pHash + plagiarism checker.
     */
    const { data: existingArtwork, error: existingError } = await supabase
      .from("registered_arts")
      .select("id")
      .eq("owner_id", user.id)
      .eq("file_hash", fileHash)
      .maybeSingle();

    if (existingError) {
      return { success: false, message: existingError.message };
    }

    if (existingArtwork) {
      return {
        success: false,
        message: "This artwork has already been registered by your account.",
      };
    }

    /**
     * TEAMMATE INTEGRATION POINT: artwork genre classification
     *
     * Call the genre classification module/API here after duplicate check passes
     * and before saving the final DB record.
     *
     */

    const uploadedImage = await uploadArtworkImageToCloudinary({
      fileBuffer,
      fileName: validFile.name,
      folder: "registered-arts",
    });

    const { data, error } = await supabase
      .from("registered_arts")
      .insert({
        owner_id: user.id,
        title: parsed.data.title,
        description: parsed.data.description || null,
        c_asset_id: uploadedImage.assetId,
        c_secure_url: uploadedImage.secureUrl,
        file_hash: fileHash,
        perceptual_hash: perceptualHash,
        author_id_hash: authorIdHash,
        evidence_hash: evidenceHash,
        evidence,
        chain: null,
        tx_hash: null,
        block_number: null,
        work_id: null,
        status: "pending_blockchain",
      })
      .select("id")
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      artworkId: data.id,
      fileHash,
      perceptualHash,
      authorIdHash,
      evidenceHash,
      imageUrl: uploadedImage.secureUrl,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to save artwork.",
    };
  }
}