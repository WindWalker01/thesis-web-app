"use client";

import { Button } from "@/components/ui/button";
import { CloudUpload, ImageUp } from "lucide-react";

function PlagarismCheckerPage() {
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
        <ImageUp size={48} color="black" />
        <h1 className="text-foreground text-2xl">Artwork To Verify</h1>
        <p className="text-muted-foreground text-center text-sm">
          Upload your digital artwork and our system will fingerprint the image
          and cross-reference it to check for plagarism.
        </p>
        <Button variant={"secondary"} size={"lg"} className="rounded-sm">
          <CloudUpload size={32} /> Upload Artwork
        </Button>
        <p className="text-muted-foreground text-center text-xs">
          Supports JPG, PNG, WEBP up to 50MB
        </p>
      </div>
    </main>
  );
}

export default PlagarismCheckerPage;
