"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CloudUpload, ImageUp, X } from "lucide-react";
import Image from "next/image";

interface UploadZoneProps {
  onUpload: (file: File) => void;
  label?: string;
  preview?: string | null;
  onClear?: () => void;
  compact?: boolean;
}

export function UploadZone({
  onUpload,
  label = "Drop artwork to verify",
  preview,
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
    [onUpload],
  );

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = "";
  };

  if (preview) {
    return (
      <div className="border-border group relative overflow-hidden rounded-xl border">
        <Image
          src={preview}
          alt="Uploaded artwork"
          width={480}
          height={compact ? 180 : 240}
          className={`w-full object-cover ${compact ? "h-44" : "h-56"}`}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-200 group-hover:bg-black/30">
          <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => inputRef.current?.click()}
              className="bg-background/90 text-foreground border-border hover:bg-background rounded-lg border px-3 py-1.5 text-xs font-medium backdrop-blur transition-colors"
            >
              Replace
            </button>
            {onClear && (
              <button
                onClick={onClear}
                className="bg-destructive/90 hover:bg-destructive flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition-colors"
              >
                <X size={11} /> Remove
              </button>
            )}
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all duration-200 ${compact ? "px-6 py-10" : "px-8 py-16"} ${dragging ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50 hover:bg-primary/[0.02]"}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      <div
        className={`${compact ? "h-12 w-12" : "h-16 w-16"} bg-background border-border shadow-primary/10 flex items-center justify-center rounded-2xl border shadow-lg`}
      >
        <ImageUp size={compact ? 20 : 28} className="text-primary" />
      </div>

      <div className="text-center">
        <p
          className={`${compact ? "text-base" : "text-lg"} text-foreground font-semibold`}
        >
          {label}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          Drag & drop or click to browse
        </p>
      </div>

      <Button
        variant="default"
        size={compact ? "sm" : "lg"}
        className="pointer-events-none rounded-lg"
      >
        <CloudUpload size={compact ? 14 : 18} />
        Upload Image
      </Button>

      <p className="text-muted-foreground text-xs">JPG, PNG, WEBP · Max 50MB</p>
    </div>
  );
}
