"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CloudUpload, ImageUp, X } from "lucide-react";
import Image from "next/image";

interface UploadZoneProps {
  onUpload: (file: File) => void;
  label?: string;
  preview?: string | null;
  filename?: string | null;
  onClear?: () => void;
  compact?: boolean;
}

export function UploadZone({
  onUpload,
  label = "Drop artwork to verify",
  preview,
  filename,
  onClear,
  compact,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith("image/")) onUpload(file);
    },
    [onUpload]
  );

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = "";
  };

  if (preview) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-border group">
        <Image
          src={preview}
          alt="Uploaded artwork"
          width={480}
          height={compact ? 180 : 240}
          className={`w-full object-cover ${compact ? "h-44" : "h-56"}`}
        />
        {/* Filename pill */}
        {filename && (
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1 text-[11px] text-slate-300 font-mono border border-white/10 max-w-[70%] truncate">
            {filename}
          </div>
        )}
        {/* Hover actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
            <button
              onClick={() => inputRef.current?.click()}
              className="bg-background/90 backdrop-blur text-foreground text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-background transition-colors"
            >
              Replace
            </button>
            {onClear && (
              <button
                onClick={onClear}
                className="bg-destructive/90 backdrop-blur text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-destructive transition-colors flex items-center gap-1"
              >
                <X size={11} /> Remove
              </button>
            )}
          </div>
        </div>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200
        ${compact ? "px-6 py-10" : "px-8 py-16"}
        ${dragging ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50 hover:bg-primary/[0.02]"}`}
    >
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

      <div className={`${compact ? "w-12 h-12" : "w-16 h-16"} rounded-2xl bg-background border border-border flex items-center justify-center shadow-lg shadow-primary/10`}>
        <ImageUp size={compact ? 20 : 28} className="text-primary" />
      </div>

      <div className="text-center">
        <p className={`${compact ? "text-base" : "text-lg"} font-semibold text-foreground`}>{label}</p>
        <p className="text-xs text-muted-foreground mt-1">Drag & drop or click to browse</p>
      </div>

      <Button variant="default" size={compact ? "sm" : "lg"} className="rounded-lg pointer-events-none">
        <CloudUpload size={compact ? 14 : 18} />
        Upload Image
      </Button>

      <p className="text-xs text-muted-foreground">JPG, PNG, WEBP · Max 50MB</p>
    </div>
  );
}
