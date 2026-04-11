import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { CompareResponse } from "./types";
import { SimilarityRing } from "./SimilarityRing";
import { SimilarityBar } from "./SimilarityBar";

interface CompareModeResultProps {
  previewA: string;
  filenameA: string;
  previewB: string;
  filenameB: string;
  result: CompareResponse;
}

function getRiskLevel(value: number) {
  if (value >= 85) return { label: "High Risk", className: "text-red-400 border-red-500/30 bg-red-500/10" };
  if (value >= 60) return { label: "Moderate Risk", className: "text-amber-400 border-amber-500/30 bg-amber-500/10" };
  return { label: "Low Risk", className: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" };
}

export function CompareModeResult({
  previewA,
  filenameA,
  previewB,
  filenameB,
  result,
}: CompareModeResultProps) {
  const { comparison } = result;
  const final = comparison.final_similarity;
  const risk = getRiskLevel(final);

  return (
    <div className="space-y-5">
      {/* Image comparison row */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">

        {/* Image A */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-[10px] font-bold">A</span>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Original Artwork</p>
                <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{result.image1}</p>
              </div>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10">
              <ShieldCheck size={11} className="mr-1" /> Source
            </Badge>
          </div>
          <Image src={previewA} alt="Image A" width={480} height={220} className="w-full h-52 object-cover" />
          <div className="px-5 py-3">
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground mb-0.5">FILENAME</p>
            <p className="text-xs font-mono text-foreground">{filenameA}</p>
          </div>
        </div>

        {/* Center: scores */}
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center gap-4 w-48">
          <p className="text-[10px] font-bold tracking-widest text-muted-foreground">FINAL SCORE</p>

          <SimilarityRing value={final} size={130} />

          <Badge variant="outline" className={`text-[10px] w-full justify-center py-1.5 ${risk.className}`}>
            {risk.label}
          </Badge>

          <div className="w-full space-y-3">
            <div className="text-center">
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground mb-2">BREAKDOWN</p>
              <div className="space-y-2 text-left">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Transform</span>
                  <span className="font-mono font-semibold text-foreground">{comparison.transform_similarity.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Block</span>
                  <span className="font-mono font-semibold text-foreground">{comparison.block_similarity.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>

          {final >= 60 && (
            <Button variant="destructive" size="sm" className="w-full text-xs gap-1.5">
              <AlertTriangle size={12} /> Report Plagiarism
            </Button>
          )}
        </div>

        {/* Image B */}
        <div className={`bg-card rounded-2xl overflow-hidden border ${final >= 85 ? "border-destructive/30" : "border-border"}`}>
          <div className={`flex items-center justify-between px-5 py-3.5 border-b ${final >= 85 ? "border-destructive/20 bg-destructive/[0.02]" : "border-border"}`}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-destructive/80 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">B</span>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Compared Image</p>
                <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{result.image2}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/10">
              Suspect
            </Badge>
          </div>
          <Image src={previewB} alt="Image B" width={480} height={220} className="w-full h-52 object-cover" />
          <div className="px-5 py-3">
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground mb-0.5">FILENAME</p>
            <p className="text-xs font-mono text-foreground">{filenameB}</p>
          </div>
        </div>
      </div>

      {/* Similarity breakdown bars */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <p className="font-semibold text-foreground">Similarity Breakdown</p>
        <SimilarityBar
          label="Final Similarity"
          value={comparison.final_similarity}
          sublabel="weighted average of transform + block scores"
        />
        <SimilarityBar
          label="Transform Similarity"
          value={comparison.transform_similarity}
          sublabel="checks 0°, 90°, 180°, 270°, mirror & flip variants"
        />
        <SimilarityBar
          label="Block Similarity"
          value={comparison.block_similarity}
          sublabel="compares top-left, top-right, bottom-left, bottom-right, center"
        />
      </div>
    </div>
  );
}
