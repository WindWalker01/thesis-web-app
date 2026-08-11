"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  ShieldCheck,
  FileText,
  UserRound,
  Shield,
  BadgeCheck,
  Fingerprint,
  Hash,
  ScrollText,
  ExternalLink,
} from "lucide-react";

import { HashInfoRow } from "./HashInfoRow";
import { SimpleInfoRow } from "./SimpleInfoRow";
import { SectionHeader } from "./SectionHeader";
import { TechnicalDetailsToggle } from "@/features/(user)/profile/subfeatures/artwork-detail/components/TechnicalDetailsToggle";
import { useArtworkDetailPage } from "@/features/(user)/profile/subfeatures/artwork-detail/hooks/useArtworkDetailPage";
import ArtworkDetailPageSkeleton from "./PageSkeleton";
import { DownloadCertificateButton } from "./DownloadCertificateButton";
import { SimilarityReportSection } from "@/features/(user)/profile/subfeatures/artwork-detail/components/SimilarityReportSection";
import { ArtworkActionsMenu } from "@/features/(user)/profile/subfeatures/artwork-detail/components/ArtworkActionsMenu";
import { VerificationStatusCard } from "@/features/(user)/profile/subfeatures/artwork-detail/components/VerificationStatusCard";
import { useArtworkReview } from "@/features/(user)/profile/subfeatures/artwork-detail/hooks/useArtworkReview";
import { ArtworkRecognitionProfile } from "@/features/(user)/community/components/ArtworkRecognitionProfile";
import { useArtworkRecognitionProfile } from "@/features/(user)/profile/subfeatures/artwork-detail/hooks/useArtworkRecognitionProfile";

type Props = {
  id: string;
};

function buildChainTxUrl(chain: string, txHash: string) {
  const normalized = chain.trim().toLowerCase();

  if (normalized.includes("polygon amoy") || normalized.includes("amoy")) {
    return `https://amoy.polygonscan.com/tx/${txHash}`;
  }

  if (normalized.includes("polygon")) {
    return `https://polygonscan.com/tx/${txHash}`;
  }

  if (normalized.includes("sepolia")) {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  }

  if (normalized.includes("ethereum")) {
    return `https://etherscan.io/tx/${txHash}`;
  }

  return `https://amoy.polygonscan.com/tx/${txHash}`;
}

export default function ArtworkDetailPage({ id }: Props) {
  const { artwork: art, isLoading, error, refetch } = useArtworkDetailPage(id);
  const { data: reviewData, refetch: refetchReview } = useArtworkReview(id);
  const { profile: recognitionProfile, isLoading: recognitionLoading } =
    useArtworkRecognitionProfile(id);

  if (isLoading) {
    return <ArtworkDetailPageSkeleton />;
  }

  if (error || !art) {
    return (
      <main className="bg-background text-foreground relative mt-12 min-h-screen overflow-hidden">
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
          <Link
            href="/profile"
            className="group text-muted-foreground hover:text-foreground mb-10 inline-flex items-center gap-2 text-sm font-semibold tracking-widest uppercase transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to profile
          </Link>

          <div className="border-border bg-card/80 rounded-2xl border p-8 backdrop-blur-xl">
            <p className="text-foreground mb-2 text-base font-semibold">
              Failed to load artwork.
            </p>
            <p className="text-muted-foreground mb-4 text-base">
              {error ?? "Artwork not found."}
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="border-primary/20 bg-primary/10 text-primary hover:bg-primary/15 inline-flex items-center rounded-xl border px-4 py-2 text-base font-semibold transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const evidenceText =
    art.evidence !== null && art.evidence !== undefined
      ? JSON.stringify(art.evidence, null, 2)
      : null;

  const plagiarismText =
    art.plagiarismHashes !== null && art.plagiarismHashes !== undefined
      ? JSON.stringify(art.plagiarismHashes, null, 2)
      : null;

  const isVerified = art.ownershipStatus === "verified";
  const hasChain = !!art.txHash && !!art.chain;
  const txUrl = hasChain ? buildChainTxUrl(art.chain!, art.txHash!) : null;
  const hasSimilarityReport = !!art.similarityScan || !!art.similarityReport;

  return (
    <main className="bg-background text-foreground relative mt-12 min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.45) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.45) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="pointer-events-none absolute -top-24 left-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute top-20 right-0 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <Link
          href="/profile"
          className="group text-muted-foreground hover:text-foreground mb-10 inline-flex items-center gap-2 text-sm font-semibold tracking-widest uppercase transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to profile
        </Link>

        <section className="border-border bg-card/80 mb-8 overflow-hidden rounded-2xl border shadow-[0_12px_50px_rgba(0,0,0,0.12)] backdrop-blur-xl">
          <div className="border-border flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 sm:px-5">
            <span className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
              Artwork Registration Record
            </span>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground hidden font-mono text-[10px] sm:inline">
                #{id.slice(0, 8).toUpperCase()}
              </span>
              <ArtworkActionsMenu
                artId={art.id}
                title={art.title}
                description={art.description ?? null}
                status={art.status}
                txHash={art.txHash}
                chain={art.chain}
                workId={art.workId}
                blockNumber={art.blockNumber}
                redirectOnDelete="/profile"
              />
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <span className="border-primary/20 bg-primary/10 text-primary inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold tracking-widest uppercase">
                    {art.category}
                  </span>

                  {isVerified ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-[11px] font-bold tracking-widest text-green-600 uppercase dark:text-green-400">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-[11px] font-bold tracking-widest text-orange-500 uppercase">
                      <ShieldCheck className="h-3 w-3" />
                      Pending
                    </span>
                  )}
                </div>

                <h1 className="text-foreground mb-5 text-3xl leading-[0.95] font-black tracking-tight wrap-break-word sm:text-4xl md:text-5xl lg:text-6xl">
                  {art.title}
                </h1>

                <div className="text-muted-foreground flex flex-wrap items-center gap-x-5 gap-y-2 text-base">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {art.uploadDate}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Shield className="h-4 w-4" />
                    {isVerified ? "Ownership verified" : "Verification pending"}
                  </span>
                </div>

                {art.description ? (
                  <p className="border-primary/20 text-muted-foreground mt-5 max-w-2xl border-l-2 pl-4 text-base leading-7">
                    {art.description}
                  </p>
                ) : null}
              </div>

              <div className="grid min-w-[260px] grid-cols-2 gap-3 xl:w-[340px]">
                {[
                  {
                    label: "Ownership",
                    value: isVerified ? "Verified" : "Pending",
                  },
                  { label: "Category", value: art.category },
                  {
                    label: "Proof",
                    value: hasChain ? "On-chain" : "Not yet published",
                  },
                  {
                    label: "Similarity",
                    value: hasSimilarityReport
                      ? "Stored report"
                      : "No stored scan",
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="border-border bg-background/70 rounded-xl border px-4 py-3"
                  >
                    <p className="text-muted-foreground mb-1 text-[10px] font-semibold tracking-widest uppercase">
                      {label}
                    </p>
                    <p className="text-foreground text-base font-semibold break-words">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {txUrl ? (
                <a
                  href={txUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-base font-semibold text-blue-500 transition-colors hover:bg-blue-500/15 sm:w-auto"
                >
                  <ExternalLink className="h-4 w-4" />
                  View blockchain transaction
                </a>
              ) : null}

              {txUrl ? <DownloadCertificateButton artwork={art} /> : null}
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="border-border/70 bg-card/85 overflow-hidden rounded-3xl border backdrop-blur-xl">
            <div className="bg-muted relative aspect-[4/3] w-full">
              {art.img ? (
                <Image
                  src={art.img}
                  alt={art.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  priority
                />
              ) : (
                <div className="text-muted-foreground flex h-full items-center justify-center">
                  <FileText className="h-12 w-12 opacity-40" />
                </div>
              )}
            </div>

            {art.creator ? (
              <div className="border-border border-t p-5 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="border-border bg-background/70 rounded-xl border p-2">
                    <UserRound className="text-muted-foreground h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
                      Creator
                    </p>
                    <p className="text-foreground text-base font-semibold">
                      {art.creator.first_name} {art.creator.last_name}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {art.creator.username}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          <section className="border-border/70 bg-card/85 overflow-hidden rounded-3xl border backdrop-blur-xl">
            <SectionHeader
              icon={<BadgeCheck className="h-4 w-4" />}
              title="Registration Overview"
            />

            <div className="grid gap-3 p-4 md:grid-cols-2 md:p-5">
              <SimpleInfoRow label="Artwork status" value={art.status} />
              <SimpleInfoRow
                label="Ownership status"
                value={isVerified ? "Verified" : "Pending"}
              />
              <SimpleInfoRow
                label="Hash status"
                value={
                  art.hashStatus === "complete" ? "Complete" : "Processing"
                }
              />
              <SimpleInfoRow label="Uploaded" value={art.uploadDate} />
              <SimpleInfoRow label="Chain" value={art.chain ?? "N/A"} />
              <SimpleInfoRow label="Work ID" value={art.workId ?? "N/A"} mono />
              <SimpleInfoRow
                label="Block number"
                value={String(art.blockNumber ?? "N/A")}
              />
              <SimpleInfoRow
                label="Transaction hash"
                value={art.txHash ?? "N/A"}
                mono
              />
            </div>
          </section>
        </div>

        <div className="mt-6">
          <SimilarityReportSection
            scan={art.similarityScan}
            report={art.similarityReport}
          />
        </div>

        {recognitionProfile && !recognitionLoading ? (
          <div className="mt-6">
            <ArtworkRecognitionProfile profile={recognitionProfile} />
          </div>
        ) : null}

        {reviewData && (
          <div className="mt-6">
            <VerificationStatusCard
              reviewId={reviewData.reviewId}
              status={reviewData.status}
              decision_reason={reviewData.decision_reason}
              review_notes={reviewData.review_notes}
              requested_documents={reviewData.requested_documents}
              resubmission_count={reviewData.resubmission_count}
              actions={reviewData.actions}
              evidence={reviewData.evidence}
              onEvidenceSubmitted={() => refetchReview()}
            />
          </div>
        )}

        <div className="mt-6">
          <TechnicalDetailsToggle
            title="Artwork hashes and stored technical details"
            description="Review the saved registration hashes, evidence payload, and additional stored artwork metadata."
          >
            <div className="space-y-6">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Fingerprint className="text-primary h-4 w-4" />
                  <p className="text-foreground text-base font-bold">
                    Hash values
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <HashInfoRow
                    label="File hash"
                    value={art.fileHash || "N/A"}
                  />
                  <HashInfoRow
                    label="Perceptual hash"
                    value={art.perceptualHash || "N/A"}
                  />
                  <HashInfoRow
                    label="Author ID hash"
                    value={art.authorIdHash ?? "N/A"}
                  />
                  <HashInfoRow
                    label="Evidence hash"
                    value={art.evidenceHash ?? "N/A"}
                  />
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <ScrollText className="text-primary h-4 w-4" />
                  <p className="text-foreground text-base font-bold">
                    Stored evidence payload
                  </p>
                </div>

                {evidenceText ? (
                  <pre className="border-border bg-background/60 text-muted-foreground overflow-x-auto rounded-2xl border p-4 text-sm break-words whitespace-pre-wrap">
                    {evidenceText}
                  </pre>
                ) : (
                  <div className="border-border bg-background/40 text-muted-foreground rounded-2xl border border-dashed p-4 text-base">
                    No evidence payload recorded.
                  </div>
                )}
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Hash className="text-primary h-4 w-4" />
                  <p className="text-foreground text-base font-bold">
                    Stored plagiarism hashes payload
                  </p>
                </div>

                {plagiarismText ? (
                  <pre className="border-border bg-background/60 text-muted-foreground overflow-x-auto rounded-2xl border p-4 text-sm break-words whitespace-pre-wrap">
                    {plagiarismText}
                  </pre>
                ) : (
                  <div className="border-border bg-background/40 text-muted-foreground rounded-2xl border border-dashed p-4 text-base">
                    No extra plagiarism hashes payload recorded.
                  </div>
                )}
              </div>
            </div>
          </TechnicalDetailsToggle>
        </div>
      </div>
    </main>
  );
}
