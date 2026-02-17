"use client";

import { Button } from "@/components/ui/button";
import { CloudUpload, ImageUp } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";

function PlagarismCheckerPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [image, setImage] = useState<File | null>(null);

  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    setImage(file);

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }
  };

  const handleUploadButtonClick = () => {
    inputRef.current?.click();
  };

  // clean the previous image object url when the user change the uploaded image
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <main className="mt-4">
      <div className="bg-background/95 border-border border-b p-2 backdrop-blur">
        <h1 className="text-foreground text-3xl">
          Plagarism Detection Analysis
        </h1>
        <p className="text-muted-foreground text-sm">
          Compare digital asset using perceptual hashing technology
        </p>
      </div>

      <div className="bg-card border-border m-4 flex flex-col items-center justify-center gap-4 rounded-sm border-3 border-dotted px-4 py-32">
        <ImageUp size={48} color="white" />
        <h1 className="text-foreground text-2xl">Artwork To Verify</h1>
        <p className="text-muted-foreground text-center text-sm">
          Upload your digital artwork and our system will fingerprint the image
          and cross-reference it to check for plagarism.
        </p>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <Button
            variant={"secondary"}
            size={"lg"}
            className="rounded-sm"
            onClick={handleUploadButtonClick}
          >
            <CloudUpload size={32} /> Upload Artwork
          </Button>
        </div>

        <p className="text-muted-foreground text-center text-xs">
          Supports JPG, PNG, WEBP up to 50MB
        </p>
      </div>

      {preview && (
        <Image src={preview} alt="Preview Image" width={250} height={250} />
      )}
    </main>
  );
}

export default PlagarismCheckerPage;
