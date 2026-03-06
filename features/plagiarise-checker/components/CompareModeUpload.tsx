import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowLeftRight } from "lucide-react";
import { UploadZone } from "./UploadZone";

interface CompareModeUploadProps {
  previewA: string | null;
  previewB: string | null;
  onUploadA: (file: File) => void;
  onUploadB: (file: File) => void;
  onClearA: () => void;
  onClearB: () => void;
  onCompare: () => void;
}

export function CompareModeUpload({
  previewA,
  previewB,
  onUploadA,
  onUploadB,
  onClearA,
  onClearB,
  onCompare,
}: CompareModeUploadProps) {
  const canCompare = !!previewA && !!previewB;

  const missingHint =
    !previewA && !previewB
      ? "Upload both images to begin comparison"
      : !previewA
        ? "Upload Image A to continue"
        : "Upload Image B to continue";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-5">
        {/* Image A */}
        <div className="bg-card border-border space-y-4 rounded-2xl border p-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <span className="text-primary-foreground text-xs font-bold">
                A
              </span>
            </div>
            <div>
              <p className="text-foreground text-sm font-semibold">
                Original Artwork
              </p>
              <p className="text-muted-foreground text-xs">
                The artwork you own or created
              </p>
            </div>
            {previewA && (
              <Badge className="ml-auto border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-400">
                <ShieldCheck size={9} className="mr-1" /> Loaded
              </Badge>
            )}
          </div>
          <UploadZone
            onUpload={onUploadA}
            label="Upload Image A"
            preview={previewA}
            onClear={onClearA}
            compact
          />
        </div>

        {/* Image B */}
        <div className="bg-card border-border space-y-4 rounded-2xl border p-6">
          <div className="flex items-center gap-3">
            <div className="bg-destructive/80 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <span className="text-xs font-bold text-white">B</span>
            </div>
            <div>
              <p className="text-foreground text-sm font-semibold">
                Suspected Copy
              </p>
              <p className="text-muted-foreground text-xs">
                The image you want to compare against
              </p>
            </div>
            {previewB && (
              <Badge
                variant="outline"
                className="ml-auto border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-400"
              >
                Loaded
              </Badge>
            )}
          </div>
          <UploadZone
            onUpload={onUploadB}
            label="Upload Image B"
            preview={previewB}
            onClear={onClearB}
            compact
          />
        </div>
      </div>

      {/* Compare CTA */}
      <div className="flex items-center gap-4">
        <Button
          size="lg"
          className="gap-2 px-8"
          disabled={!canCompare}
          onClick={onCompare}
        >
          <ArrowLeftRight size={16} />
          Compare Images
        </Button>
        {!canCompare ? (
          <p className="text-muted-foreground text-sm">{missingHint}</p>
        ) : (
          <p className="flex items-center gap-1.5 text-sm text-emerald-400">
            <ShieldCheck size={14} /> Both images loaded — ready to compare
          </p>
        )}
      </div>
    </div>
  );
}
