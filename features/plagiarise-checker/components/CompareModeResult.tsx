import { Badge } from "@/components/ui/badge";
import { ShieldCheck, TriangleAlert, Info, Hash } from "lucide-react";
import Image from "next/image";
import { CompareResponse } from "./../types";
import { SimilarityRing } from "./SimilarityRing";
import { SimilarityBar } from "./SimilarityBar";
import { EvidenceNote } from "./EvidenceNote";
import {
  getPrimaryScore,
  isNoEvidenceMatch,
  getEvidenceSummary,
  getEvidenceDetail,
  getDominantTransformLabel,
  getTransformEvidenceStatus,
  getBlockEvidenceStatus,
  getBestScalePair,
} from "../lib/match-metrics";

import type { SimilarityRiskThresholds } from "../lib/similarity-risk";
import {
  DEFAULT_SIMILARITY_RISK_THRESHOLDS,
  getSimilarityRiskTier,
} from "../lib/similarity-risk";

interface CompareModeResultProps {
  previewA: string;
  filenameA: string;
  previewB: string;
  filenameB: string;
  result: CompareResponse;
  /** Admin-synced thresholds (critical = red, moderate = amber). Defaults to shared fallbacks. */
  thresholds?: SimilarityRiskThresholds;
}

function getRiskLevel(
  value: number,
  thresholds: SimilarityRiskThresholds = DEFAULT_SIMILARITY_RISK_THRESHOLDS,
) {
  const tier = getSimilarityRiskTier(value, thresholds);
  if (tier === "critical")
    return {
      label: "High Risk",
      className: "text-red-400 border-red-500/30 bg-red-500/10",
    };
  if (tier === "moderate")
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
  thresholds = DEFAULT_SIMILARITY_RISK_THRESHOLDS,
}: CompareModeResultProps) {
  const { comparison } = result;
  // v2 primary score: percentile-calibrated confidence; falls back to
  // `final_similarity` on legacy responses.
  const final = getPrimaryScore(comparison);
  const noEvidence = isNoEvidenceMatch(comparison);
  const evidence = getEvidenceSummary(comparison);
  const evidenceDetail = getEvidenceDetail(comparison);
  const dominant = getDominantTransformLabel(comparison.dominant_transform);
  const lowContent = comparison.low_content_warning === true || result.low_content_warning === true;
  const transformEvidenceStatus = getTransformEvidenceStatus(comparison);
  const blockEvidenceStatus = getBlockEvidenceStatus(comparison);
  const bestScalePair = getBestScalePair(comparison);
  const risk = getRiskLevel(final, thresholds);

  return (
    <div className="space-y-5">
      {/* v2: either image lacked content-bearing blocks */}
      {lowContent && (
        <div className="bg-amber-500/5 border border-amber-500/30 rounded-2xl px-5 py-3 flex items-center gap-2.5 text-amber-500/90">
          <TriangleAlert size={15} className="shrink-0" />
          <p className="text-sm">
            Low image detail detected — these results may be less reliable.
          </p>
        </div>
      )}
      {/* Image comparison row */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_auto_1fr]">
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
                <p className="text-foreground text-base font-semibold">
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
            className="h-44 w-full object-cover sm:h-52"
          />
          <div className="px-5 py-3">
            <p className="text-muted-foreground mb-0.5 text-[10px] font-bold tracking-widest">
              FILENAME
            </p>
            <p className="text-foreground font-mono text-sm">{filenameA}</p>
          </div>
        </div>

        {/* Center: scores */}
        <div className="bg-card border-border flex w-full flex-col items-center gap-4 rounded-2xl border p-5 sm:mx-auto sm:w-56 lg:w-48">
          <p className="text-muted-foreground text-[10px] font-bold tracking-widest">
            {noEvidence ? "RESULT" : "FINAL SCORE"}
          </p>

          {noEvidence ? (
            <div className="flex h-[130px] w-[130px] flex-col items-center justify-center gap-2 rounded-full border-2 border-emerald-500/40 bg-emerald-500/5 px-3 text-center">
              <ShieldCheck size={26} className="text-emerald-400" />
              <p className="text-[10px] font-semibold leading-tight text-emerald-400">
                No plagiarism detected
              </p>
            </div>
          ) : (
            <SimilarityRing value={final} size={130} thresholds={thresholds} />
          )}

          <Badge
            variant="outline"
            className={`w-full justify-center py-1.5 text-[10px] ${
              noEvidence
                ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                : risk.className
            }`}
          >
            {noEvidence ? "Clean negative" : risk.label}
          </Badge>

          <EvidenceNote
            evidence={evidence}
            evidenceDetail={evidenceDetail}
            lowContent={lowContent}
            transformEvidenceStatus={transformEvidenceStatus}
            blockEvidenceStatus={blockEvidenceStatus}
            className="text-center"
          />
          {dominant && !noEvidence && (
            <p className="text-center text-[11px] text-muted-foreground">
              Consistent under a {dominant}
            </p>
          )}

          {/* v3: show best scale pair if available */}
          {comparison.best_scale_pair && (
            <p className="text-center text-[11px] text-muted-foreground">
              Best scale pair: {comparison.best_scale_pair[0]} → {comparison.best_scale_pair[1]}
            </p>
          )}
          {bestScalePair && (
            <p className="text-center text-[11px] text-muted-foreground">
              Best scale pair: {bestScalePair[0]} → {bestScalePair[1]}
            </p>
          )}

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

          {/* the system don't need this button since the users are reporting on community page */}
          {/* {final >= 60 && (
            <Button
              variant="destructive"
              size="sm"
              className="w-full gap-1.5 text-sm"
            >
              <AlertTriangle size={12} /> Report Plagiarism
            </Button>
          )} */}
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
                <p className="text-foreground text-base font-semibold">
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
            className="h-44 w-full object-cover sm:h-52"
          />
          <div className="px-5 py-3">
            <p className="text-muted-foreground mb-0.5 text-[10px] font-bold tracking-widest">
              FILENAME
            </p>
            <p className="text-foreground font-mono text-sm">{filenameB}</p>
          </div>
        </div>
      </div>

      {/* Similarity breakdown bars */}
      <div className="bg-card border-border space-y-5 rounded-2xl border p-4 sm:p-6">
        <p className="text-foreground font-semibold">Similarity Breakdown</p>
        <SimilarityBar
          label="Calibrated Confidence"
          value={final}
          sublabel="percentile vs. a baseline of known-unrelated artwork pairs"
          thresholds={thresholds}
        />
        <SimilarityBar
          label="Raw Similarity"
          value={comparison.raw_similarity ?? comparison.final_similarity}
          sublabel="consensus algorithm score (uncalibrated)"
          thresholds={thresholds}
        />
        <SimilarityBar
          label="Transform Similarity"
          value={comparison.transform_similarity}
          sublabel="checks 0°, 90°, 180°, 270°, mirror & flip variants"
          thresholds={thresholds}
        />
        <SimilarityBar
          label="Block Similarity"
          value={comparison.block_similarity}
          sublabel="compares top-left, top-right, bottom-left, bottom-right, center"
          thresholds={thresholds}
        />
        {/* v2 explainability: agreement counts behind the score */}
        {(comparison.block_agreements !== undefined ||
          comparison.transform_agreements !== undefined) && (
          <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-border pt-4 text-[11px]">
            {comparison.block_agreements !== undefined && (
              <p className="text-muted-foreground">
                Block agreements:{" "}
                <span className="text-foreground font-semibold">
                  {comparison.block_agreements} of 5
                </span>
              </p>
            )}
            {comparison.transform_agreements !== undefined && (
              <p className="text-muted-foreground">
                Transform agreements:{" "}
                <span className="text-foreground font-semibold">
                  {comparison.transform_agreements} of 6
                </span>
              </p>
            )}
            {comparison.content_blocks_used !== undefined && (
              <p className="text-muted-foreground">
                Content blocks used:{" "}
                <span className="text-foreground font-semibold">
                  {comparison.content_blocks_used} of 5
                </span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
