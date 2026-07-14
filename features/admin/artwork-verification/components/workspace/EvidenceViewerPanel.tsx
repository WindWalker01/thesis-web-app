"use client";

import { memo } from "react";
import Image from "next/image";
import {
  FileText,
  Download,
  MessageSquare,
  Paperclip,
  Eye,
} from "lucide-react";
import { formatTimeAgo } from "@/lib/client-utils";
import type { ReviewEvidence } from "../../types";

interface EvidenceViewerPanelProps {
  evidence: ReviewEvidence[];
}

export const EvidenceViewerPanel = memo(function EvidenceViewerPanel({
  evidence,
}: EvidenceViewerPanelProps) {
  if (!evidence || evidence.length === 0) return null;

  const totalFiles = evidence.reduce((sum, ev) => sum + ev.files.length, 0);

  return (
    <div className="rounded-2xl border-2 border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50/80 to-white dark:from-blue-950/30 dark:to-background overflow-hidden">
      {/* Header */}
      <div className="border-b border-blue-200 dark:border-blue-900 bg-blue-500/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
            <Paperclip className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-blue-700 dark:text-blue-300">
              Artist Evidence &mdash; Submitted by the Creator
            </h3>
            <p className="text-sm text-blue-600/70 dark:text-blue-400/70">
              {totalFiles} file{totalFiles !== 1 ? "s" : ""} across {evidence.length} submission{evidence.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-6">
        {evidence.map((ev) => (
          <div
            key={ev.id}
            className="rounded-xl border border-border bg-white dark:bg-slate-900 p-5"
          >
            {/* Artist Message */}
            {ev.message && (
              <div className="flex items-start gap-3 mb-4 pb-4 border-b border-border">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                    {`Artist${"'"}s Explanation`}
                  </p>
                  <p className="text-sm leading-relaxed text-foreground">
                    {ev.message}
                  </p>
                </div>
              </div>
            )}

            {/* Files Grid — larger thumbnails */}
            {ev.files.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  Uploaded Files ({ev.files.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {ev.files.map((file, i) => (
                    <a
                      key={i}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex flex-col rounded-xl border-2 border-border bg-background overflow-hidden hover:border-blue-400 hover:shadow-md transition-all duration-200"
                    >
                      {/* Thumbnail / Icon */}
                      <div className="relative aspect-square bg-muted flex items-center justify-center overflow-hidden">
                        {file.type.startsWith("image/") ? (
                          <Image
                            src={file.url}
                            alt={file.name}
                            fill
                            className="object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-muted-foreground">
                            <FileText className="h-10 w-10" />
                            <span className="text-[10px] font-medium uppercase">
                              {file.type.split("/").pop() || "FILE"}
                            </span>
                          </div>
                        )}

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 text-white text-xs font-semibold bg-black/60 rounded-lg px-3 py-1.5">
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </div>
                        </div>

                        {/* Download button */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-colors">
                            <Download className="h-4 w-4 text-slate-700" />
                          </div>
                        </div>
                      </div>

                      {/* File name */}
                      <div className="px-3 py-2.5 min-w-0">
                        <p className="truncate text-xs font-medium text-foreground">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {(file.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamp */}
            <p className="mt-3 text-[11px] text-muted-foreground flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400" />
              Submitted {formatTimeAgo(ev.created_at)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
});