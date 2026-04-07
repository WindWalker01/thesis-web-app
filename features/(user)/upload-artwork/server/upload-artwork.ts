"use server";

import crypto from "node:crypto";
import { ethers } from "ethers";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formSchema } from "@/features/(user)/upload-artwork/schemas/artwork-schema";
import { uploadArtworkImageToCloudinary } from "@/features/(user)/upload-artwork/server/upload-image";
import { checkPlagiarismWeb } from "@/features/plagiarise-checker";

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
      return { success: false, message: existingError.message };
    }

    if (existingArtwork) {
      return {
        success: false,
        message: "This artwork has already been registered by your account.",
      };
    }

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

    const result = await checkPlagiarismWeb(validFile);

    if (!result.success) {
      return { success: false, message: "Unexpected Server Error" };
    }

    const similarity = result.best_search.similarity_percentage;

    // Strong match (almost identical)
    if (similarity >= 93) {
      return {
        success: false,
        message: `Duplicate artwork detected (very high similarity). ${Object.values(result.hashes)[0][0]}`,
      };
    }

    // Possible plagiarism
    if (similarity >= 87.5) {
      return {
        success: false,
        message: "Artwork is highly similar to an existing image.",
      };
    }

    // Optional review range
    // TODO: When the moderation module got implemented this needs to revisited
    if (similarity >= 75) {
      // return {
      //   success: false,
      //   message: `Moderate similarity detected: ${similarity}%. Contact us to review your submission.`,
      // };
    }

    /* 
      naiisip ko if kasama sa nirereturn nung api na /check/web yung perceptual hash, dun na lang natin kunin para isang call na lang sa api, pero depende pa rin sa diskarte mo pre kung ano yung best
    */
    /*     const perceptualHash = await generatePerceptualHashBytes32(fileBuffer); */

    const perceptualHash = result.original_hash as `0x${string}`;

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
        status: "pending_blockchain",
        plagiarism_hashes: result.hashes,
      })
      .select("id")
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    /**
     * TEAMMATE INTEGRATION POINT: artwork genre classification
     *
     * Call the genre classification module/API here after duplicate check passes
     * and before saving the final DB record.
     *
     */

    const genres = await getArtworkGenres(validFile, data.id);

    console.log(genres);

    await supabase.from("art_genres").insert(genres);

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

async function getArtworkGenres(file: File, art_id: number) {
  const genres = await fetchGenreClassification(file);

  if (!genres.success) {
    return [{}];
  }

  let filtered_genres = genres.results.filter(
    (genre) => genre.score * 100 >= 1,
  );

  if (filtered_genres.length < 1) {
    filtered_genres = genres.results.slice(0, 3);
  }

  const genre_to_insert = filtered_genres.map((genre) => ({
    art_id: art_id,
    genre_id: genre.index,
  }));

  return genre_to_insert;
}

async function fetchGenreClassification(
  file: File,
): Promise<GenreClassificationResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DIGITAL_ART_API_URL}/classify/`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail ?? "Failed to Classify Art Genre");
  }

  return response.json();
}

interface GenreScoreLabel {
  score: number;
  label: string;
  index: number;
}

interface GenreClassificationResult {
  success: boolean;
  results: Array<GenreScoreLabel>;
}
