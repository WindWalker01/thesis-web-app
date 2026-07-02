"use server";

import { ethers } from "ethers";

import { createSupabaseServerClient } from "@/lib/supabase/server";
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
} from "@/features/(user)/upload-artwork/lib/artwork-hashing";
import { getArtworkStatusFromSimilarity } from "@/features/(user)/upload-artwork/lib/moderation-policy";
import { fetchGenreClassification } from "./fetch-genre";

const HARD_BLOCK_DATABASE_SIMILARITY_THRESHOLD = 100;

async function rollbackArtworkInsert(params: {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  artworkId: string;
}) {
  const { supabase, artworkId } = params;
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
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "You must be logged in.",
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
      ethers.toUtf8Bytes(user.id),
    ) as `0x${string}`;

    const fileHash = ethers.keccak256(fileBuffer) as `0x${string}`;

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

    const result = await checkPlagiarismWeb(validFile);

    if (!result.success) {
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

    if (
      primaryMatch?.type === "database" &&
      typeof primaryMatch.similarity === "number" &&
      primaryMatch.similarity >= HARD_BLOCK_DATABASE_SIMILARITY_THRESHOLD
    ) {
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

    if (
      typeof result.original_hash !== "string" ||
      result.original_hash.trim().length === 0
    ) {
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

    const similarityScanRow = buildSimilarityScanInsert({
      artId: insertedArtworkId,
      ownerId: user.id,
      result,
      status: "completed",
    });

    const { error: scanInsertError } = await supabase
      .from("art_similarity_scans")
      .insert(similarityScanRow);

    if (scanInsertError) {
      await rollbackArtworkInsert({
        supabase,
        artworkId: insertedArtworkId,
      });

      return {
        success: false,
        message: scanInsertError.message,
        similarityReport,
        otherMatches,

      };
    }

    // Fetch genre suggestions from the classifier when the artwork status
    // warrants classification. Results are returned to the client for the user
    // to confirm — nothing is inserted into art_genres here.
    let genreSuggestions: GenreScoreLabel[] = [];

    if (shouldClassify) {
      try {
        const genreResult = await fetchGenreClassification(validFile);

        if (genreResult.success) {
          // Return the top 10 genres by rank (API already returns results
          // sorted by score descending). Score is not used as a filter here —
          // all top-10 entries are shown regardless of confidence value.
          // TODO: to filter by score in the future, replace the slice below with:
          //   genreResult.results.filter((g) => g.score * 100 >= <threshold>)
          // where <threshold> is a percentage (e.g. 1 for 1%).
          genreSuggestions = genreResult.results.slice(0, 10);
        }
      } catch {
        // Non-fatal: genre suggestions are a convenience, not a hard requirement.
        // The upload succeeds even if classification fails.
        genreSuggestions = [];
      }
    }

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
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to save artwork.",
      similarityReport: null,
      otherMatches: null,
    };
  }
}
