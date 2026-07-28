"use server";

import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export type UploadedArtworkImage = {
  assetId: string | null;
  secureUrl: string | null;
  publicId: string | null;
  format: string | null;
  bytes: number | null;
  width: number | null;
  height: number | null;
};

/**
 * Deletes an artwork image from Cloudinary by its public ID.
 * Used for rollback when the database insert fails after upload.
 * Non-throwing — logs errors but never blocks the caller.
 */
export async function deleteArtworkImageFromCloudinary(
  publicId: string
): Promise<void> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    if (result.result !== "ok" && result.result !== "not found") {
      console.error(
        `[Cloudinary] Failed to delete image ${publicId}: ${result.result}`,
      );
    }
  } catch (error) {
    console.error(
      `[Cloudinary] Error deleting image ${publicId}:`,
      error instanceof Error ? error.message : error,
    );
  }
}

export async function uploadArtworkImageToCloudinary(params: {
  fileBuffer: Buffer;
  fileName: string;
  folder?: string;
}): Promise<UploadedArtworkImage> {
  const { fileBuffer, fileName, folder = "registered-arts" } = params;

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
        filename_override: fileName,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary upload failed: empty response."));
          return;
        }

        resolve(result);
      }
    );

    stream.end(fileBuffer);
  });

  return {
    assetId: result.asset_id ?? null,
    secureUrl: result.secure_url ?? null,
    publicId: result.public_id ?? null,
    format: result.format ?? null,
    bytes: result.bytes ?? null,
    width: result.width ?? null,
    height: result.height ?? null,
  };
}