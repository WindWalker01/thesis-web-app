"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  CloudUpload,
  FileImage,
  ImageIcon,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ACCEPT_ATTR,
  MAX_FILE_SIZE_MB,
  RECOMMENDED_FORMAT_LABELS,
  SUPPORTED_FORMAT_LABELS,
} from "@/features/(user)/upload-artwork/schemas/artwork-schema";

type ArtworkDropzoneProps = {
  file: File | undefined;
  previewUrl: string | null;
  dragOver: boolean;
  setDragOver: (value: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  showProgressView: boolean;
  fileError?: string;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileSelect: (file?: File) => void;
  onRemoveFile: () => void;
};

const isRecommended = (format: string) =>
  RECOMMENDED_FORMAT_LABELS.includes(
    format as (typeof RECOMMENDED_FORMAT_LABELS)[number],
  );

/**
 * Drag-and-drop artwork file picker with preview, supported-format hints, and
 * the legal notice. Interactions are disabled while the upload pipeline is
 * running (`showProgressView`).
 */
export function ArtworkDropzone({
  file,
  previewUrl,
  dragOver,
  setDragOver,
  inputRef,
  showProgressView,
  fileError,
  onDrop,
  onFileSelect,
  onRemoveFile,
}: ArtworkDropzoneProps) {
  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => !showProgressView && inputRef.current?.click()}
        onDrop={showProgressView ? undefined : onDrop}
        onDragOver={(e) => {
          if (showProgressView) return;
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onKeyDown={(e) => {
          if (showProgressView) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={[
          "group rounded-xl border-2 border-dashed p-6 transition-all",
          showProgressView ? "cursor-default" : "cursor-pointer outline-none",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/60 hover:bg-muted/40",
        ].join(" ")}
      >
        {!file ? (
          <div className="flex min-h-[380px] flex-col items-center justify-center gap-4 text-center">
            <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-2xl">
              <CloudUpload className="text-primary h-8 w-8" />
            </div>

            <div className="space-y-1">
              <p className="text-base font-semibold">
                Drag and drop your artwork here
              </p>
              <p className="text-muted-foreground text-base">
                Or click to browse from your device
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {SUPPORTED_FORMAT_LABELS.map((format) => (
                <Badge
                  key={format}
                  variant={isRecommended(format) ? "default" : "outline"}
                  className={
                    isRecommended(format) ? "opacity-90" : "opacity-60"
                  }
                >
                  {format}
                </Badge>
              ))}
            </div>

            <p className="text-muted-foreground text-xs">
              <span className="text-foreground font-medium">Recommended:</span>{" "}
              PNG or JPG for best detection accuracy
            </p>

            <p className="text-muted-foreground text-sm">
              Maximum file size: {MAX_FILE_SIZE_MB}MB
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted overflow-hidden rounded-lg border">
              {previewUrl ? (
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={previewUrl}
                    alt={file.name}
                    fill
                    unoptimized
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center">
                  <ImageIcon className="text-muted-foreground h-16 w-16" />
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-medium">{file.name}</p>
                <p className="text-muted-foreground text-sm">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              {!showProgressView && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          className="hidden"
          onChange={(e) => onFileSelect(e.target.files?.[0])}
          disabled={showProgressView}
        />
      </div>

      {fileError && (
        <p className="text-destructive text-base font-medium">{fileError}</p>
      )}

      <Alert>
        <FileImage className="h-4 w-4" />
        <AlertTitle>Supported formats</AlertTitle>
        <AlertDescription className="space-y-1">
          <span className="block">
            {SUPPORTED_FORMAT_LABELS.join(", ")} are all accepted.
          </span>
          <span className="text-muted-foreground block">
            For best similarity detection results, upload in{" "}
            <span className="text-foreground font-medium">PNG or JPG</span> —
            the most widely used formats for digital artwork.
          </span>
        </AlertDescription>
      </Alert>

      <Alert className="border-amber-500/30 bg-amber-500/5 text-amber-950 dark:text-amber-100">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Legal notice</AlertTitle>
        <AlertDescription>
          By continuing, you confirm that this is your original work or that you
          are authorized to register it. See our{" "}
          <Link
            href="/terms-of-use"
            className="font-medium underline underline-offset-4"
          >
            Terms of Use.
          </Link>
        </AlertDescription>
      </Alert>
    </>
  );
}
