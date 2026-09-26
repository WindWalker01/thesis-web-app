"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

type Props = {
  artId: string;
};

function parseFilenameFromDisposition(
  disposition: string | null,
): string | null {
  if (!disposition) return null;

  const encodedMatch = /filename="([^"]+)"/i.exec(disposition);
  if (encodedMatch?.[1]) {
    try {
      return decodeURIComponent(encodedMatch[1]);
    } catch {
      return encodedMatch[1];
    }
  }

  const plainMatch = /filename=([^;]+)/i.exec(disposition);
  return plainMatch?.[1]?.trim() ?? null;
}

export function DownloadOriginalButton({ artId }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    try {
      setIsDownloading(true);

      const response = await fetch(`/api/artworks/${artId}/download`);

      if (!response.ok) {
        let message = "Failed to download the original artwork.";
        try {
          const body = await response.json();
          if (body?.error) message = body.error;
        } catch {
          // Keep the default message if the body isn't JSON.
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const filename =
        parseFilenameFromDisposition(
          response.headers.get("content-disposition"),
        ) ?? `${artId}.png`;

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      toast.success("Original artwork downloaded.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to download the original artwork.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-2 text-base font-semibold text-green-600 transition-colors hover:bg-green-500/15 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto dark:text-green-400"
    >
      <Download className="h-4 w-4" />
      {isDownloading ? "Downloading..." : "Download original"}
    </button>
  );
}
