import { Globe, Info } from "lucide-react";
import { UploadZone } from "./UploadZone";
import { StepBadge } from "./StepBadge";

interface WebModeUploadProps {
  onUpload: (file: File) => void;
}

export function WebModeUpload({ onUpload }: WebModeUploadProps) {
  return (
    <div className="grid grid-cols-2 gap-5">
      {/* Upload card */}
      <div className="bg-card border-border space-y-5 rounded-2xl border p-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
            <Globe size={17} className="text-primary-foreground" />
          </div>
          <div>
            <p className="text-foreground text-sm font-semibold">
              Artwork to Verify
            </p>
            <p className="text-muted-foreground text-xs">
              Upload a single digital artwork
            </p>
          </div>
        </div>
        <UploadZone onUpload={onUpload} />
      </div>

      {/* How it works + info */}
      <div className="space-y-4">
        <div className="bg-card border-border space-y-4 rounded-2xl border p-6">
          <p className="text-foreground text-sm font-semibold">How it works</p>
          <div className="space-y-4">
            <StepBadge
              n="01"
              label="Upload Artwork"
              desc="Submit your digital artwork for fingerprinting"
            />
            <StepBadge
              n="02"
              label="Web Crawl"
              desc="System searches millions of indexed pages and marketplaces"
            />
            <StepBadge
              n="03"
              label="Region Mapping"
              desc="Suspected regions flagged with confidence scores"
            />
            <StepBadge
              n="04"
              label="Report"
              desc="Export full analysis PDF or flag for legal review"
            />
          </div>
        </div>

        <div className="bg-primary/5 border-primary/20 flex items-start gap-3 rounded-xl border p-4">
          <Info size={16} className="text-primary mt-0.5 shrink-0" />
          <p className="text-muted-foreground text-xs leading-relaxed">
            All uploads are processed securely. Your artwork data is encrypted
            and never stored beyond the analysis session.
          </p>
        </div>
      </div>
    </div>
  );
}
