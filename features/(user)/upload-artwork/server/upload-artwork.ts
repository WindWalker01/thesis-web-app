"use server";

import { ethers } from "ethers";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireActiveAccount } from "@/lib/account-status";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formSchema } from "@/features/(user)/upload-artwork/schemas/artwork-schema";
import { uploadArtworkImageToCloudinary } from "@/features/(user)/upload-artwork/server/upload-image";
import { checkPlagiarismWeb } from "@/features/plagiarise-checker";
import {
  buildSimilarityReport,
  buildSimilarityScanInsert,
  getPrimarySimilarityMatch,
  getSimilarityReportMatch,
} from "@/features/(user)/upload-artwork/server/art-similarity-scan";

import { RecordArtworkInDatabaseResult, GenreScoreLabel } from "../types";
import {
  sha256Hex,
  normalizePerceptualHashToBytes32,
  stableStringify,
  getArtworkStatusFromSimilarity,
} from "..";
import { fetchGenreClassification } from "./fetch-genre";

const HARD_BLOCK_DATABASE_SIMILARITY_THRESHOLD = 100;

async function rollbackArtworkInsert(params: {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  artworkId: string;
}) {
  const { supabase, artworkId } = params;
  console.log(`[Artwork Registration] Rolling back artwork insert: ${artworkId}`);
  await supabase.from("registered_arts").delete().eq("id", artworkId);
}

function isUuidLike(value: string | null | undefined): value is string {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function recordArtworkInDatabase(
  formData: FormData,
): Promise<RecordArtworkInDatabaseResult> {
  console.log("[Artwork Registration] Registration started");

  try {
    const supabase = await createSupabaseServerClient();

    // Verify account is active
    let userId: string;
    try {
      userId = await requireActiveAccount();
    } catch {
      console.log("[Artwork Registration] Account is suspended or banned");
      return {
        success: false,
        message: "Your account is currently suspended or banned. You cannot upload artwork.",
        similarityReport: null,
        otherMatches: null,
      };
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
        similarityReport: null,
        otherMatches: null,
      };
    }

    const validFile = parsed.data.file;
    const arrayBuffer = await validFile.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const authorIdHash = ethers.keccak256(
      ethers.toUtf8Bytes(userId),
    ) as `0x${string}`;

    const fileHash = ethers.keccak256(fileBuffer) as `0x${string}`;

    const { data: existingArtwork, error: existingError } = await supabase
      .from("registered_arts")
      .select("id")
      .eq("owner_id", userId)
      .eq("file_hash", fileHash)
      .maybeSingle();

    if (existingError) {
      return {
        success: false,
        message: existingError.message,
        similarityReport: null,
        otherMatches: null,
      };
    }

    if (existingArtwork) {
      return {
        success: false,
        message: "This artwork has already been registered by your account.",
        similarityReport: null,
        otherMatches: null,
      };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 1: Run the plagiarism check FIRST (we need the perceptual hash
    //          because registered_arts.perceptual_hash is NOT NULL)
    // ─────────────────────────────────────────────────────────────────────────
    console.log("[Similarity Scan] Scan started — calling plagiarism API...");

    const result = await checkPlagiarismWeb(validFile);
    console.log("[Similarity Scan] Scan completed — API response received");

    // ─────────────────────────────────────────────────────────────────────────
    // Step 2: Process the plagiarism results
    // ─────────────────────────────────────────────────────────────────────────
    if (!result.success) {
      console.log("[Similarity Scan] Plagiarism check failed — no artwork created");
      return {
        success: false,
        message: "Unexpected server error during similarity checking.",
        similarityReport: null,
        otherMatches: null,
      };
    }

    const primaryMatch = getPrimarySimilarityMatch(result);
    const reportMatch = getSimilarityReportMatch(result);
    let similarityReport = buildSimilarityReport(result);
    const similarity = similarityReport?.similarityPercentage ?? 0;
    const otherMatches = result.other_matches;

    if (
      similarityReport &&
      reportMatch?.type === "database" &&
      isUuidLike(reportMatch.url)
    ) {
      const adminSupabase = createSupabaseAdminClient();

      const { data: matchedArtwork, error: matchedArtworkError } =
        await adminSupabase
          .from("registered_arts")
          .select("id, title, c_secure_url")
          .eq("id", reportMatch.url)
          .maybeSingle();

      if (matchedArtworkError) {
        return {
          success: false,
          message: matchedArtworkError.message,
          similarityReport,
          otherMatches,
        };
      }

      similarityReport = {
        ...similarityReport,
        matchedArtworkId: matchedArtwork?.id ?? reportMatch.url,
        matchedArtworkTitle: matchedArtwork?.title ?? null,
        matchedArtworkImageUrl: matchedArtwork?.c_secure_url ?? null,
        previewImageUrl: matchedArtwork?.c_secure_url ?? null,
      };
    }

    // Check for hard block (100% database match)
    if (
      primaryMatch?.type === "database" &&
      typeof primaryMatch.similarity === "number" &&
      primaryMatch.similarity >= HARD_BLOCK_DATABASE_SIMILARITY_THRESHOLD
    ) {
      console.log("[Similarity Scan] Hard block triggered — 100% database match");
      return {
        success: false,
        message:
          "Upload blocked. An exact 100% match was detected against a registered artwork in the database.",
        similarityReport,
        otherMatches,
      };
    }

    const matchSource =
      primaryMatch?.type === "database" || primaryMatch?.type === "internet"
        ? primaryMatch.type
        : null;

    const { artworkStatus, moderationMessage, shouldClassify } =
      getArtworkStatusFromSimilarity(similarity, matchSource);

    // Validate perceptual hash
    if (
      typeof result.original_hash !== "string" ||
      result.original_hash.trim().length === 0
    ) {
      console.log("[Similarity Scan] Missing perceptual hash from API response");
      return {
        success: false,
        message: "Missing perceptual hash from similarity checking service.",
        similarityReport,
        otherMatches,
      };
    }

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
        otherMatches,
      };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 3: Build evidence
    // ─────────────────────────────────────────────────────────────────────────
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

    const evidenceHash = ethers.keccak256(
      ethers.toUtf8Bytes(stableStringify(evidence)),
    ) as `0x${string}`;

    // ─────────────────────────────────────────────────────────────────────────
    // Step 4: Upload image to Cloudinary
    // ─────────────────────────────────────────────────────────────────────────
    console.log("[Artwork Registration] Uploading image to Cloudinary...");
    const uploadedImage = await uploadArtworkImageToCloudinary({
      fileBuffer,
      fileName: validFile.name,
      folder: "registered-arts",
    });
    console.log("[Artwork Registration] Cloudinary upload complete");

    // ─────────────────────────────────────────────────────────────────────────
    // Step 5: Insert the registered_arts record
    // ─────────────────────────────────────────────────────────────────────────
    console.log("[Artwork Registration] Inserting artwork into database...");

    const { data, error } = await supabase
      .from("registered_arts")
      .insert({
        owner_id: userId,
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

    if (error) {
      const isDuplicate =
        error.code === "23505" ||
        error.message.toLowerCase().includes("duplicate") ||
        error.message.toLowerCase().includes("unique");

      console.error("[Artwork Registration] Database insert error:", error);

      return {
        success: false,
        message: isDuplicate
          ? "This artwork has already been registered by your account."
          : error.message,
        similarityReport,
        otherMatches,
      };
    }

    const insertedArtworkId = data.id;
    console.log(`[Artwork Registration] Artwork inserted: ${insertedArtworkId}`);

    // ─────────────────────────────────────────────────────────────────────────
    // Step 6: Create the art_similarity_scans record (status: "completed"
    //          since the scan already ran successfully)
    // ─────────────────────────────────────────────────────────────────────────
    console.log("[Similarity Scan] Creating scan record...");

    const scanInsertPayload = buildSimilarityScanInsert({
      artId: insertedArtworkId,
      ownerId: userId,
      result,
      status: "completed",
    });

    const { error: scanInsertError } = await supabase
      .from("art_similarity_scans")
      .insert(scanInsertPayload);

    if (scanInsertError) {
      console.error("[Similarity Scan] Failed to create scan record:", scanInsertError);
      await rollbackArtworkInsert({ supabase, artworkId: insertedArtworkId });
      return {
        success: false,
        message: scanInsertError.message,
        similarityReport,
        otherMatches,
      };
    }

    console.log("[Similarity Scan] Scan record created with full results");

    // ─────────────────────────────────────────────────────────────────────────
    // Step 7: Create artwork_reviews record for admin verification if needed
    // Artworks with 'flagged' or 'under_review' status require admin review
    // ─────────────────────────────────────────────────────────────────────────
    if (artworkStatus === "flagged" || artworkStatus === "under_review") {
      console.log("[Artwork Verification] Creating review record for admin verification...");

      const { error: reviewInsertError } = await supabase
        .from("artwork_reviews")
        .insert({
          artwork_id: insertedArtworkId,
          status: "pending",
          reviewer_id: null,
          assigned_at: null,
        });

      if (reviewInsertError) {
        console.error("[Artwork Verification] Failed to create review record:", reviewInsertError);
        // Don't rollback the entire upload - the artwork and scan still exist
        // The review can be created manually by an admin if needed
      } else {
        console.log("[Artwork Verification] Review record created successfully");
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 8: Fetch genre suggestions
    // ─────────────────────────────────────────────────────────────────────────
    let genreSuggestions: GenreScoreLabel[] = [];

    if (shouldClassify) {
      try {
        const genreResult = await fetchGenreClassification(validFile);

        if (genreResult.success) {
          genreSuggestions = genreResult.results.slice(0, 10);
        }
      } catch {
        // Non-fatal: genre suggestions are a convenience, not a hard requirement.
        genreSuggestions = [];
      }
    }

    console.log("[Artwork Registration] Registration completed successfully");

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
      genreSuggestions,
      otherMatches,
    };
  } catch (error) {
    console.error("[Artwork Registration] Unexpected error:", error);

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to save artwork.",
      similarityReport: null,
      otherMatches: null,
    };
  }
}