"use client";

// import { Button } from "@/components/ui/button";
// import { CloudUpload, ImageUp } from "lucide-react";

function EmptyState() {
  return (
    <div className="bg-card border-border m-4 flex flex-col items-center justify-center gap-4 rounded-sm border-3 border-dotted px-4 py-32">
      {/* <ImageUp size={48} color="white" />
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
      </p> */}
    </div>
  );
}

export default EmptyState;
