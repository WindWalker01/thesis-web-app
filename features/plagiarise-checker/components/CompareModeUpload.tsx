import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowLeftRight } from "lucide-react";
import { UploadZone } from "./UploadZone";

interface CompareModeUploadProps {
  fileA: File | null;
  fileB: File | null;
  previewA: string | null;
  previewB: string | null;
  onUploadA: (file: File) => void;
  onUploadB: (file: File) => void;
  onClearA: () => void;
  onClearB: () => void;
  onCompare: () => void;
}

export function CompareModeUpload({
  fileA,
  fileB,
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
    !previewA && !previewB ? "Upload both images to begin comparison"
    : !previewA ? "Upload Image A to continue"
    : "Upload Image B to continue";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-5">
        {/* Image A */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground text-xs font-bold">A</span>
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">Original Artwork</p>
              <p className="text-xs text-muted-foreground">The artwork you own or created</p>
            </div>
            {previewA && (
              <Badge className="ml-auto bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                <ShieldCheck size={9} className="mr-1" /> Loaded
              </Badge>
            )}
          </div>
          <UploadZone
            onUpload={onUploadA}
            label="Upload Image A"
            preview={previewA}
            filename={fileA?.name ?? null}
            onClear={onClearA}
            compact
          />
        </div>

        {/* Image B */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-destructive/80 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">B</span>
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">Suspected Copy</p>
              <p className="text-xs text-muted-foreground">The image you want to compare against</p>
            </div>
            {previewB && (
              <Badge variant="outline" className="ml-auto text-amber-400 border-amber-500/30 bg-amber-500/10 text-[10px]">
                Loaded
              </Badge>
            )}
          </div>
          <UploadZone
            onUpload={onUploadB}
            label="Upload Image B"
            preview={previewB}
            filename={fileB?.name ?? null}
            onClear={onClearB}
            compact
          />
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center gap-4">
        <Button size="lg" className="gap-2 px-8" disabled={!canCompare} onClick={onCompare}>
          <ArrowLeftRight size={16} /> Compare Images
        </Button>
        {!canCompare ? (
          <p className="text-sm text-muted-foreground">{missingHint}</p>
        ) : (
          <p className="text-sm text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck size={14} /> Both images loaded — ready to compare
          </p>
        )}
      </div>
    </div>
  );
}
