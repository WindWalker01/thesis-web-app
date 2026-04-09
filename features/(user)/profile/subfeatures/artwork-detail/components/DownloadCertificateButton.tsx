"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

import type { ArtworkDetail } from "../../../types";
import { generateArtworkCertificatePdf } from "@/features/certificate-generator";
import type { CertificateArtwork } from "@/features/certificate-generator/types";

type Props = {
    artwork: ArtworkDetail;
};

function toCertificateArtwork(artwork: ArtworkDetail): CertificateArtwork {
    return {
        id: artwork.id,
        title: artwork.title,
        description: artwork.description,
        img: artwork.img,
        category: artwork.category,
        uploadDate: artwork.uploadDate,
        createdAt: artwork.createdAt,
        ownershipStatus: artwork.ownershipStatus,
        fileHash: artwork.fileHash,
        perceptualHash: artwork.perceptualHash,
        authorIdHash: artwork.authorIdHash,
        evidenceHash: artwork.evidenceHash,
        chain: artwork.chain,
        txHash: artwork.txHash,
        blockNumber: artwork.blockNumber,
        workId: artwork.workId,
        status: artwork.status,
        creator: artwork.creator,
    };
}

export function DownloadCertificateButton({ artwork }: Props) {
    const [isGenerating, setIsGenerating] = useState(false);

    async function handleDownload() {
        try {
            setIsGenerating(true);
            await generateArtworkCertificatePdf(toCertificateArtwork(artwork));
            toast.success("Certificate downloaded.");
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to generate certificate."
            );
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/15 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
            <Download className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Download certificate"}
        </button>
    );
}