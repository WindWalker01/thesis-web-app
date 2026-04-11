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
    ScanSearch,
    ExternalLink,
} from "lucide-react";

import { HashInfoRow } from "./HashInfoRow";
import { SimpleInfoRow } from "./SimpleInfoRow";
import { SectionHeader } from "./SectionHeader";
import { TechnicalDetailsToggle } from "@/features/(user)/profile/subfeatures/artwork-detail/components/TechnicalDetailsToggle";
import { useArtworkDetailPage } from "@/features/(user)/profile/subfeatures/artwork-detail/hooks/useArtworkDetailPage";
import ArtworkDetailPageSkeleton from "./PageSkeleton";
import { DownloadCertificateButton } from "./DownloadCertificateButton";
import { SimilarityReportSection } from "@/features/(user)/profile/components/SimilarityReportSection";
import { ArtworkActionsMenu } from "@/features/(user)/profile/subfeatures/artwork-detail/components/ArtworkActionsMenu";

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

    if (isLoading) {
        return <ArtworkDetailPageSkeleton />;
    }

    if (error || !art) {
        return (
            <main className="relative min-h-screen overflow-hidden bg-background text-foreground mt-12">
                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                    <Link
                        href="/profile"
                        className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-10"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                        Back to profile
                    </Link>

                    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-8">
                        <p className="text-sm font-semibold text-foreground mb-2">
                            Failed to load artwork.
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                            {error ?? "Artwork not found."}
                        </p>

                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="inline-flex items-center rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/15 transition-colors"
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
        <main className="relative min-h-screen overflow-hidden bg-background text-foreground mt-12">
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

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <Link
                    href="/profile"
                    className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-10"
                >
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                    Back to profile
                </Link>

                <section className="mb-8 overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-[0_12px_50px_rgba(0,0,0,0.12)]">
                    <div className="flex items-center justify-between border-b border-border px-5 py-3">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Artwork Registration Record
                        </span>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono text-muted-foreground">
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

                    <div className="p-6 md:p-8">
                        <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
                            <div className="min-w-0 flex-1">
                                <div className="mb-5 flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
                                        {art.category}
                                    </span>

                                    {isVerified ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400">
                                            <CheckCircle className="w-3 h-3" />
                                            Verified
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-orange-500">
                                            <ShieldCheck className="w-3 h-3" />
                                            Pending
                                        </span>
                                    )}
                                </div>

                                <h1 className="mb-5 text-4xl font-black tracking-tight leading-[0.95] text-foreground md:text-5xl lg:text-6xl">
                                    {art.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        {art.uploadDate}
                                    </span>

                                    <span className="flex items-center gap-1.5">
                                        <Shield className="w-4 h-4" />
                                        {isVerified ? "Ownership verified" : "Verification pending"}
                                    </span>
                                </div>

                                {art.description ? (
                                    <p className="mt-5 max-w-2xl border-l-2 border-primary/20 pl-4 text-sm leading-7 text-muted-foreground">
                                        {art.description}
                                    </p>
                                ) : null}
                            </div>

                            <div className="grid min-w-[260px] grid-cols-2 gap-3 xl:w-[340px]">
                                {[
                                    { label: "Ownership", value: isVerified ? "Verified" : "Pending" },
                                    { label: "Category", value: art.category },
                                    { label: "Proof", value: hasChain ? "On-chain" : "Not yet published" },
                                    {
                                        label: "Similarity",
                                        value: hasSimilarityReport ? "Stored report" : "No stored scan",
                                    },
                                ].map(({ label, value }) => (
                                    <div
                                        key={label}
                                        className="rounded-xl border border-border bg-background/70 px-4 py-3"
                                    >
                                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                            {label}
                                        </p>
                                        <p className="break-words text-sm font-semibold text-foreground">
                                            {value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            {txUrl ? (
                                <a
                                    href={txUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-500 hover:bg-blue-500/15 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    View blockchain transaction
                                </a>
                            ) : null}

                            {txUrl ? (
                                <DownloadCertificateButton artwork={art} />
                            ) : null}
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                    <section className="overflow-hidden rounded-3xl border border-border/70 bg-card/85 backdrop-blur-xl">
                        <div className="relative aspect-[4/3] w-full bg-muted">
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
                                <div className="flex h-full items-center justify-center text-muted-foreground">
                                    <FileText className="h-12 w-12 opacity-40" />
                                </div>
                            )}
                        </div>

                        {art.creator ? (
                            <div className="border-t border-border p-5 md:p-6">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl border border-border bg-background/70 p-2">
                                        <UserRound className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                            Creator
                                        </p>
                                        <p className="text-sm font-semibold text-foreground">
                                            {art.creator.fullName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {art.creator.username}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </section>

                    <section className="rounded-3xl border border-border/70 bg-card/85 backdrop-blur-xl overflow-hidden">
                        <SectionHeader
                            icon={<BadgeCheck className="w-4 h-4" />}
                            title="Registration Overview"
                        />

                        <div className="grid gap-3 p-4 md:p-5 md:grid-cols-2">
                            <SimpleInfoRow label="Artwork status" value={art.status} />
                            <SimpleInfoRow
                                label="Ownership status"
                                value={isVerified ? "Verified" : "Pending"}
                            />
                            <SimpleInfoRow
                                label="Hash status"
                                value={art.hashStatus === "complete" ? "Complete" : "Processing"}
                            />
                            <SimpleInfoRow label="Uploaded" value={art.uploadDate} />
                            <SimpleInfoRow label="Chain" value={art.chain ?? "N/A"} />
                            <SimpleInfoRow label="Work ID" value={art.workId ?? "N/A"} mono />
                            <SimpleInfoRow label="Block number" value={String(art.blockNumber ?? "N/A")} />
                            <SimpleInfoRow label="Transaction hash" value={art.txHash ?? "N/A"} mono />
                        </div>
                    </section>
                </div>

                <div className="mt-6">
                    <SimilarityReportSection
                        scan={art.similarityScan}
                        report={art.similarityReport}
                    />
                </div>

                <div className="mt-6">
                    <TechnicalDetailsToggle
                        title="Artwork hashes and stored technical details"
                        description="Review the saved registration hashes, evidence payload, and additional stored artwork metadata."
                    >
                        <div className="space-y-6">
                            <div>
                                <div className="mb-3 flex items-center gap-2">
                                    <Fingerprint className="w-4 h-4 text-primary" />
                                    <p className="text-sm font-bold text-foreground">Hash values</p>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <HashInfoRow label="File hash" value={art.fileHash || "N/A"} />
                                    <HashInfoRow label="Perceptual hash" value={art.perceptualHash || "N/A"} />
                                    <HashInfoRow label="Author ID hash" value={art.authorIdHash ?? "N/A"} />
                                    <HashInfoRow label="Evidence hash" value={art.evidenceHash ?? "N/A"} />
                                </div>
                            </div>

                            <div>
                                <div className="mb-3 flex items-center gap-2">
                                    <ScrollText className="w-4 h-4 text-primary" />
                                    <p className="text-sm font-bold text-foreground">Stored evidence payload</p>
                                </div>

                                {evidenceText ? (
                                    <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-2xl border border-border bg-background/60 p-4 text-xs text-muted-foreground">
                                        {evidenceText}
                                    </pre>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-border bg-background/40 p-4 text-sm text-muted-foreground">
                                        No evidence payload recorded.
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="mb-3 flex items-center gap-2">
                                    <Hash className="w-4 h-4 text-primary" />
                                    <p className="text-sm font-bold text-foreground">
                                        Stored plagiarism hashes payload
                                    </p>
                                </div>

                                {plagiarismText ? (
                                    <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-2xl border border-border bg-background/60 p-4 text-xs text-muted-foreground">
                                        {plagiarismText}
                                    </pre>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-border bg-background/40 p-4 text-sm text-muted-foreground">
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