"use client";

import { useState, useRef } from "react";
import type { ReportEvidence } from "@/features/reports/types";
import { Button } from "@/components/ui/button";
import { formatDateTime, getFileIcon } from "@/features/reports/lib/report-utils";
import { MAX_EVIDENCE_FILE_SIZE, ALLOWED_EVIDENCE_MIME_TYPES, isAllowedFileType } from "@/features/reports/schemas/report-schemas";
import { toast } from "sonner";
import { cn } from "@/lib/client-utils";

type EvidenceGalleryProps = {
  evidence: ReportEvidence[];
  reportId: string;
  canUpload?: boolean;
  onUpload?: (file: File, description?: string) => Promise<void>;
};

export function EvidenceGallery({
  evidence,
  reportId,
  canUpload = false,
  onUpload,
}: EvidenceGalleryProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!onUpload) return;

    // Validate file size
    if (file.size > MAX_EVIDENCE_FILE_SIZE) {
      toast.error("File must be under 10MB");
      return;
    }

    // Validate file type
    if (!isAllowedFileType(file.type, file.name)) {
      toast.error("Unsupported file type");
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(file);
      toast.success("Evidence uploaded successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload evidence");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const isImage = (mimeType: string | null) => mimeType?.startsWith("image/");

  return (
    <div className="space-y-4">
      {/* Evidence List */}
      {evidence.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {evidence.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg border bg-card"
            >
              {/* Preview */}
              {isImage(item.mime_type) ? (
                <div className="aspect-video overflow-hidden bg-muted">
                  <img
                    src={item.file_url}
                    alt={item.file_name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center bg-muted">
                  <span className="text-4xl">{getFileIcon(item.mime_type)}</span>
                </div>
              )}

              {/* Info */}
              <div className="p-3">
                <p className="truncate text-sm font-medium" title={item.file_name}>
                  {item.file_name}
                </p>
                {item.description && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                )}
                <time
                  className="mt-1 block text-xs text-muted-foreground/60"
                  dateTime={item.created_at}
                >
                  {formatDateTime(item.created_at)}
                </time>

                {/* Download */}
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-7 w-full"
                >
                  <a
                    href={item.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={item.file_name}
                  >
                    <svg
                      className="mr-1.5 h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                    Download
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No evidence uploaded yet.
        </p>
      )}

      {/* Upload Area */}
      {canUpload && onUpload && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          )}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          aria-label="Upload additional evidence"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_EVIDENCE_MIME_TYPES.join(",")}
            className="hidden"
            onChange={handleFileSelect}
            aria-hidden="true"
          />

          {isUploading ? (
            <>
              <svg
                className="mb-2 h-8 w-8 animate-spin text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <svg
                className="mb-2 h-8 w-8 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                />
              </svg>
              <p className="text-sm font-medium">
                Upload Additional Evidence
              </p>
              <p className="text-xs text-muted-foreground">
                Drag and drop or click to browse (max 10MB)
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}