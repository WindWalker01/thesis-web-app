"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageUp, RotateCcw, ScanSearch, ShieldCheck, Info } from "lucide-react";
import Image from "next/image";
import { formatFileSize, type ArtworkFileMeta } from "../lib/file-metadata";

interface ArtworkPreviewProps {
  preview: string;
  filename: string;
  meta: ArtworkFileMeta;
  onReplace: () => void;
  onAnalyze: () => void;
}

export function ArtworkPreview({
  preview,
  filename,
  meta,
  onReplace,
  onAnalyze,
}: ArtworkPreviewProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <ImageUp size={17} className="text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-base text-foreground">Review Artwork</p>
            <p className="text-sm text-muted-foreground">
              Confirm your upload before running the similarity analysis.
            </p>
          </div>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shrink-0">
          <ShieldCheck size={11} className="mr-1" /> Ready
        </Badge>
      </div>

      {/* Large preview */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border bg-muted">
        <Image
          src={preview}
          alt="Selected artwork preview"
          fill
          className="object-contain"
          unoptimized
        />
      </div>

      {/* Metadata */}
      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <MetadataItem label="Filename" value={filename} mono />
        <MetadataItem label="File type" value={meta.type || "Image"} />
        <MetadataItem label="File size" value={formatFileSize(meta.size)} />
        <MetadataItem
          label="Image dimensions"
          value={
            meta.width && meta.height ? `${meta.width} × ${meta.height} px` : "—"
          }
        />
      </dl>

      {/* Explanation */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3 items-start">
        <Info size={16} className="text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your artwork will be compared against registered artworks and
          available online sources for visual similarity.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          size="lg"
          className="w-full gap-2 sm:w-auto"
          onClick={onAnalyze}
        >
          <ScanSearch size={16} /> Analyze Artwork
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full gap-2 sm:w-auto"
          onClick={onReplace}
        >
          <RotateCcw size={16} /> Replace Artwork
        </Button>
      </div>
    </div>
  );
}

function MetadataItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/50 px-3 py-2 min-w-0">
      <dt className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-0.5">
        {label}
      </dt>
      <dd
        className={`text-sm text-foreground truncate ${mono ? "font-mono" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
