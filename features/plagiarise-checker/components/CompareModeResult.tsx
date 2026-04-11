import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { CompareResponse } from "./../types";
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
  if (value >= 85)
    return {
      label: "High Risk",
      className: "text-red-400 border-red-500/30 bg-red-500/10",
    };
  if (value >= 60)
    return {
      label: "Moderate Risk",
      className: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    };
  return {
    label: "Low Risk",
    className: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  };
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
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
        {/* Image A */}
        <div className="bg-card border-border overflow-hidden rounded-2xl border">
          <div className="border-border flex items-center justify-between border-b px-5 py-3.5">
            <div className="flex items-center gap-2">
              <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-md">
                <span className="text-primary-foreground text-[10px] font-bold">
                  A
                </span>
              </div>
              <div>
                <p className="text-foreground text-sm font-semibold">
                  Original Artwork
                </p>
                <p className="text-muted-foreground mt-0.5 font-mono text-[11px]">
                  {result.image1}
                </p>
              </div>
            </div>
            <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10">
              <ShieldCheck size={11} className="mr-1" /> Source
            </Badge>
          </div>
          <Image
            src={previewA}
            alt="Image A"
            width={480}
            height={220}
            className="h-52 w-full object-cover"
          />
          <div className="px-5 py-3">
            <p className="text-muted-foreground mb-0.5 text-[10px] font-bold tracking-widest">
              FILENAME
            </p>
            <p className="text-foreground font-mono text-xs">{filenameA}</p>
          </div>
        </div>

        {/* Center: scores */}
        <div className="bg-card border-border flex w-48 flex-col items-center gap-4 rounded-2xl border p-5">
          <p className="text-muted-foreground text-[10px] font-bold tracking-widest">
            FINAL SCORE
          </p>

          <SimilarityRing value={final} size={130} />

          <Badge
            variant="outline"
            className={`w-full justify-center py-1.5 text-[10px] ${risk.className}`}
          >
            {risk.label}
          </Badge>

          <div className="w-full space-y-3">
            <div className="text-center">
              <p className="text-muted-foreground mb-2 text-[10px] font-bold tracking-widest">
                BREAKDOWN
              </p>
              <div className="space-y-2 text-left">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Transform</span>
                  <span className="text-foreground font-mono font-semibold">
                    {comparison.transform_similarity.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Block</span>
                  <span className="text-foreground font-mono font-semibold">
                    {comparison.block_similarity.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {final >= 60 && (
            <Button
              variant="destructive"
              size="sm"
              className="w-full gap-1.5 text-xs"
            >
              <AlertTriangle size={12} /> Report Plagiarism
            </Button>
          )}
        </div>

        {/* Image B */}
        <div
          className={`bg-card overflow-hidden rounded-2xl border ${final >= 85 ? "border-destructive/30" : "border-border"}`}
        >
          <div
            className={`flex items-center justify-between border-b px-5 py-3.5 ${final >= 85 ? "border-destructive/20 bg-destructive/[0.02]" : "border-border"}`}
          >
            <div className="flex items-center gap-2">
              <div className="bg-destructive/80 flex h-6 w-6 items-center justify-center rounded-md">
                <span className="text-[10px] font-bold text-white">B</span>
              </div>
              <div>
                <p className="text-foreground text-sm font-semibold">
                  Compared Image
                </p>
                <p className="text-muted-foreground mt-0.5 font-mono text-[11px]">
                  {result.image2}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/10"
            >
              Suspect
            </Badge>
          </div>
          <Image
            src={previewB}
            alt="Image B"
            width={480}
            height={220}
            className="h-52 w-full object-cover"
          />
          <div className="px-5 py-3">
            <p className="text-muted-foreground mb-0.5 text-[10px] font-bold tracking-widest">
              FILENAME
            </p>
            <p className="text-foreground font-mono text-xs">{filenameB}</p>
          </div>
        </div>
      </div>

      {/* Similarity breakdown bars */}
      <div className="bg-card border-border space-y-5 rounded-2xl border p-6">
        <p className="text-foreground font-semibold">Similarity Breakdown</p>
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
