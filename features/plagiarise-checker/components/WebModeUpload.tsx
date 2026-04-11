import { Globe, Info } from "lucide-react";
import { UploadZone } from "./UploadZone";

interface WebModeUploadProps {
  onUpload: (file: File) => void;
}

export function WebModeUpload({ onUpload }: WebModeUploadProps) {
  return (
    <div className="grid grid-cols-2 gap-5">
      {/* Upload card */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Globe size={17} className="text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">Artwork to Verify</p>
            <p className="text-xs text-muted-foreground">Upload a single digital artwork</p>
          </div>
        </div>
        <UploadZone onUpload={onUpload} />
      </div>

      {/* What we check */}
      <div className="space-y-4">
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <p className="font-semibold text-sm text-foreground">What we check</p>

          <div className="space-y-4">
            {[
              { n: "01", label: "Registered Database", desc: "Matches against all artwork registered in our platform" },
              { n: "02", label: "Web Crawl", desc: "Searches public sources, marketplaces, and social platforms" },
              { n: "03", label: "Transform Variants", desc: "Detects flipped, rotated, and mirrored copies" },
              { n: "04", label: "Block Analysis", desc: "Compares image regions individually for partial plagiarism" },
            ].map(({ n, label, desc }) => (
              <div key={n} className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-lg bg-background border border-border flex items-center justify-center text-[10px] font-bold text-primary font-mono shrink-0 mt-0.5">
                  {n}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3 items-start">
          <Info size={16} className="text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            All uploads are processed securely. Your artwork data is encrypted and never stored beyond the analysis session.
          </p>
        </div>
      </div>
    </div>
  );
}
