"use server";

import { ethers } from "ethers";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formSchema } from "@/features/(user)/upload-artwork/schemas/artwork-schema";
import { uploadArtworkImageToCloudinary } from "@/features/(user)/upload-artwork/server/upload-image";
import { checkPlagiarismWeb } from "@/features/plagiarise-checker";
import {
  buildSimilarityReport,
  buildSimilarityScanInsert,
} from "@/features/(user)/upload-artwork/server/art-similarity-scan";

import { RecordArtworkInDatabaseResult } from "../types";
import {
  sha256Hex,
  normalizePerceptualHashToBytes32,
  stableStringify,
  getArtworkStatusFromSimilarity
} from "..";
import { getArtworkGenres } from "./fetch-genre";

/**
 * Compensating rollback for partial-write failure.
 *
 * This is not a true database transaction, but it restores consistency when
 * the parent artwork row was inserted successfully and a later dependent step
 * (similarity scan or genre mapping) fails.
 *
 * Because dependent rows reference registered_arts, removing the parent record
 * prevents the system from keeping a half-finished registration in the database.
 */
async function rollbackArtworkInsert(params: {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  artworkId: string;
}) {
  const { supabase, artworkId } = params;

  await supabase.from("registered_arts").delete().eq("id", artworkId);
}

/**
 * Main server action responsible for:
 * - validating the upload request
 * - generating file/authorship/evidence hashes
 * - calling plagiarism detection
 * - assigning moderation status
 * - uploading the source image
 * - storing the artwork record and related scan data
 * - optionally classifying the artwork when moderation permits
 *
 * The function is intentionally linear so the workflow is easy to follow and debug.
 */
export async function recordArtworkInDatabase(
  formData: FormData,
): Promise<RecordArtworkInDatabaseResult> {
  try {
    /**
     * Create a server-side Supabase client bound to the current user session.
     * This is used for both authentication and protected row inserts.
     */
    const supabase = await createSupabaseServerClient();

    /**
     * Authentication guard:
     * artwork registration must always belong to an authenticated user.
     */
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "You must be logged in.",
        similarityReport: null,
      };
    }

    /**
     * Extract raw form fields from FormData.
     *
     * We read everything as untrusted input first, then validate through zod
     * before any processing happens.
     */
    const title = formData.get("title");
    const description = formData.get("description");
    const rightsConfirmed = formData.get("rightsConfirmed") === "true";
    const file = formData.get("file");

    /**
     * Validate and coerce request data using the upload schema.
     *
     * This blocks unsupported files, missing ownership confirmation,
     * and invalid title/description payloads before any expensive work begins.
     */
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
        similarityReport: null,
      };
    }

    /**
     * Read the uploaded file into memory once so all downstream hashing and upload
     * operations work from the same byte source.
     */
    const validFile = parsed.data.file;
    const arrayBuffer = await validFile.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    /**
     * authorIdHash is the blockchain-safe representation of the internal user id.
     * fileHash is the keccak256 digest of the actual uploaded file bytes.
     *
     * These values are used both for deduplication and for the later on-chain record.
     */
    const authorIdHash = ethers.keccak256(
      ethers.toUtf8Bytes(user.id),
    ) as `0x${string}`;

    const fileHash = ethers.keccak256(fileBuffer) as `0x${string}`;

    /**
     * Pre-insert duplicate guard.
     *
     * We prevent the same user from registering the exact same file twice
     * based on the unique owner_id + file_hash combination.
     */
    const { data: existingArtwork, error: existingError } = await supabase
      .from("registered_arts")
      .select("id")
      .eq("owner_id", user.id)
      .eq("file_hash", fileHash)
      .maybeSingle();

    if (existingError) {
      return {
        success: false,
        message: existingError.message,
        similarityReport: null,
      };
    }

    if (existingArtwork) {
      return {
        success: false,
        message: "This artwork has already been registered by your account.",
        similarityReport: null,
      };
    }

    /**
     * Call the plagiarism service before persisting the artwork.
     *
     * This gives us:
     * - the similarity score
     * - the source/match details for UI reporting
     * - the raw perceptual hash family used for plagiarism evidence
     */
    const result = await checkPlagiarismWeb(validFile);

    if (!result.success) {
      return {
        success: false,
        message: "Unexpected server error during similarity checking.",
        similarityReport: null,
      };
    }

    /**
     * Convert the plagiarism service response into a stable UI/database shape
     * and compute the moderation decision from the best similarity score.
     */
    const similarityReport = buildSimilarityReport(result);
    const similarity = similarityReport?.similarityPercentage ?? 0;

    const { artworkStatus, moderationMessage, shouldClassify } =
      getArtworkStatusFromSimilarity(similarity);

    /**
     * The blockchain flow requires a valid perceptual hash.
     * We fail early if the service did not return one.
     */
    if (
      typeof result.original_hash !== "string" ||
      result.original_hash.trim().length === 0
    ) {
      return {
        success: false,
        message: "Missing perceptual hash from similarity checking service.",
        similarityReport,
      };
    }

    /**
     * Normalize the compact pHash into bytes32 format so the value can be:
     * - stored consistently in the database
     * - reused directly for blockchain registration/retry
     */
    let perceptualHash: `0x${string}`;

    try {
      perceptualHash = normalizePerceptualHashToBytes32(result.original_hash);
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Invalid perceptual hash format.",
        similarityReport,
      };
    }

    /**
     * Evidence object is the canonical proof package for this registration.
     *
     * It captures the important file characteristics and the normalized pHash,
     * then gets hashed into evidenceHash for later blockchain attestation.
     */
    const evidence = {
      v: 1,
      internalUserIdHash: authorIdHash,
      filename: validFile.name,
      mime: validFile.type,
      size: fileBuffer.length,
      sha256: "0x" + sha256Hex(fileBuffer),
      phashAlgo: "phash",
      phash: perceptualHash,
      uploadedAt: new Date().toISOString(),
    };

    /**
     * Deterministic evidence digest used as the immutable proof payload reference.
     */
    const evidenceHash = ethers.keccak256(
      ethers.toUtf8Bytes(stableStringify(evidence)),
    ) as `0x${string}`;

    /**
     * Upload the original artwork image asset before database insertion.
     *
     * This gives us the permanent hosted asset identifiers stored with the artwork row.
     * Note: if a later DB step fails, Cloudinary cleanup is still a separate concern.
     */
    const uploadedImage = await uploadArtworkImageToCloudinary({
      fileBuffer,
      fileName: validFile.name,
      folder: "registered-arts",
    });

    /**
     * Persist the main artwork record.
     *
     * This is the parent row for all related upload artifacts and the source of truth
     * for ownership, hashes, moderation status, and future blockchain state.
     */
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
        status: artworkStatus,
        plagiarism_hashes: result.hashes,
      })
      .select("id")
      .single();

    /**
     * Defensive duplicate handling:
     * even if the pre-check passed, concurrent requests can still race here.
     * We normalize unique constraint failures into a friendly duplicate message.
     */
    if (error) {
      const isDuplicate =
        error.code === "23505" ||
        error.message.toLowerCase().includes("duplicate") ||
        error.message.toLowerCase().includes("unique");

      return {
        success: false,
        message: isDuplicate
          ? "This artwork has already been registered by your account."
          : error.message,
        similarityReport,
      };
    }

    const insertedArtworkId = data.id;

    /**
     * Persist the similarity scan record linked to the newly created artwork.
     *
     * This keeps the raw scan result and summarized match details available
     * for audit, admin review, and UI explanation.
     */
    const similarityScanRow = buildSimilarityScanInsert({
      artId: insertedArtworkId,
      ownerId: user.id,
      result,
      status: "completed",
    });

    const { error: scanInsertError } = await supabase
      .from("art_similarity_scans")
      .insert(similarityScanRow);

    /**
     * If scan persistence fails, roll back the parent artwork record so we do not
     * leave a partially registered upload behind.
     */
    if (scanInsertError) {
      await rollbackArtworkInsert({
        supabase,
        artworkId: insertedArtworkId,
      });

      return {
        success: false,
        message: scanInsertError.message,
        similarityReport,
      };
    }

    /**
     * Genre classification is intentionally skipped for suspicious uploads.
     *
     * The goal is to avoid spending extra work on artwork that is already routed
     * into moderation review.
     */
    if (shouldClassify) {
      const genres = await getArtworkGenres(validFile, insertedArtworkId);

      if (genres.length > 0) {
        const { error: genresError } = await supabase
          .from("art_genres")
          .insert(genres);

        /**
         * If genre persistence fails after the parent row was created,
         * roll back the artwork to keep the registration consistent.
         */
        if (genresError) {
          await rollbackArtworkInsert({
            supabase,
            artworkId: insertedArtworkId,
          });

          return {
            success: false,
            message: genresError.message,
            similarityReport,
          };
        }
      }
    }

    /**
     * Final success response returned to the client.
     *
     * The caller uses this to continue the upload progress UI and eventually
     * trigger the blockchain step for safe uploads.
     */
    return {
      success: true,
      artworkId: insertedArtworkId,
      fileHash,
      perceptualHash,
      authorIdHash,
      evidenceHash,
      imageUrl: uploadedImage.secureUrl,
      message: moderationMessage,
      similarityReport,
      artworkStatus,
    };
  } catch (error) {
    /**
     * Last-resort catch for unexpected runtime failures.
     *
     * We keep the response user-safe while still surfacing the actual message
     * when the thrown value is a standard Error instance.
     */
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to save artwork.",
      similarityReport: null,
    };
  }
}
