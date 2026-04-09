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
    ScanSearch,
    Shield,
    BadgeCheck,
    Fingerprint,
    Hash,
    ScrollText,
} from "lucide-react";

import { HashInfoRow } from "./HashInfoRow";
import { SimpleInfoRow } from "./SimpleInfoRow";
import { SectionHeader } from "./SectionHeader";
import { TechnicalDetailsToggle } from "@/features/(user)/profile/(artwork-details)/artwork-detail/components/TechnicalDetailsToggle";
import { useArtworkDetailPage } from "@/features/(user)/profile/(artwork-details)/artwork-detail/hooks/useArtworkDetailPage";
import ArtworkDetailPageSkeleton from "./PageSkeleton";
import { DownloadCertificateButton } from "./DownloadCertificateButton";

type Props = {
    id: string;
};

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
    const hasChain = !!art.txHash && art.txHash !== "N/A";
    const hasPlagiarismResults = !!plagiarismText;

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
                        <span className="text-[10px] font-mono text-muted-foreground">
                            #{id.slice(0, 8).toUpperCase()}
                        </span>
                    </div>

                    <div className="p-6 md:p-8">
                        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-8">
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-5">
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

                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95] text-foreground mb-5">
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

                                {art.description && (
                                    <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground border-l-2 border-primary/20 pl-4">
                                        {art.description}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 min-w-[260px] xl:w-[320px]">
                                {[
                                    { label: "Ownership", value: isVerified ? "Verified" : "Pending" },
                                    { label: "Category", value: art.category },
                                    { label: "Proof", value: hasChain ? "On-chain" : "Not yet published" },
                                    { label: "Scan", value: hasPlagiarismResults ? "Stored results" : "No saved results" },
                                ].map(({ label, value }) => (
                                    <div
                                        key={label}
                                        className="rounded-xl border border-border bg-background/70 px-4 py-3"
                                    >
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                                            {label}
                                        </p>
                                        <p className="text-sm font-semibold text-foreground break-words">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            {hasChain && (
                                <a
                                    href={`https://amoy.polygonscan.com/tx/${art.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-500 hover:bg-blue-500/15 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-link-icon lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                    View on chain
                                </a>
                            )}

                            <DownloadCertificateButton artwork={art} />
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
                    <div className="space-y-6">
                        <div className="overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-xl">
                            <SectionHeader icon={<FileText className="w-3.5 h-3.5" />} title="Artwork Preview" />
                            <div className="p-4 md:p-5">
                                <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                                    {art.img ? (
                                        <Image
                                            src={art.img}
                                            alt={art.title}
                                            fill
                                            sizes="(max-width: 1280px) 100vw, 60vw"
                                            priority
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FileText className="w-12 h-12 text-muted-foreground" />
                                        </div>
                                    )}

                                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-5">
                                        <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest mb-1">
                                            Registered artwork
                                        </p>
                                        <p className="text-white text-lg font-black leading-tight">{art.title}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-semibold text-white/80">
                                                {art.category}
                                            </span>
                                            {isVerified && (
                                                <span className="rounded-full border border-green-400/30 bg-green-500/20 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-semibold text-green-300">
                                                    Verified
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-xl">
                            <SectionHeader icon={<ScanSearch className="w-3.5 h-3.5" />} title="Plagiarism Summary" />
                            <div className="p-4 md:p-5">
                                {hasPlagiarismResults ? (
                                    <div className="rounded-xl border border-blue-500/15 bg-blue-500/5 p-4">
                                        <p className="text-sm font-semibold text-foreground mb-1">
                                            Stored plagiarism results found
                                        </p>
                                        <p className="text-xs text-muted-foreground leading-5">
                                            This artwork has saved plagiarism comparison data. Open the technical details section below to inspect the raw payload.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-dashed border-border bg-background/50 p-5">
                                        <p className="text-sm font-semibold text-foreground mb-1">
                                            No stored plagiarism scan results
                                        </p>
                                        <p className="text-xs text-muted-foreground leading-5">
                                            This artwork does not currently have saved plagiarism result payloads.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-xl">
                            <SectionHeader icon={<UserRound className="w-3.5 h-3.5" />} title="Creator Info" />
                            <div className="p-4 md:p-5">
                                {art.creator ? (
                                    <div className="flex items-center gap-4">
                                        <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-muted shrink-0">
                                            {art.creator.profileImage ? (
                                                <Image
                                                    src={art.creator.profileImage}
                                                    alt={art.creator.fullName}
                                                    fill
                                                    sizes="56px"
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <UserRound className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-foreground">{art.creator.fullName}</p>
                                            <p className="text-xs text-muted-foreground">{art.creator.username}</p>
                                            <p className="text-[11px] text-muted-foreground mt-1">
                                                Artwork owner and registered creator of this record.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Creator information is unavailable.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-xl">
                            <SectionHeader icon={<BadgeCheck className="w-3.5 h-3.5" />} title="Proof Summary" />
                            <div className="p-4 md:p-5 space-y-2">
                                <SimpleInfoRow label="Ownership Status" value={isVerified ? "Verified" : "Pending"} />
                                <SimpleInfoRow label="System Status" value={art.status} />
                                <SimpleInfoRow label="Blockchain Proof" value={hasChain ? "Available" : "Not available"} />
                                <SimpleInfoRow label="Certificate" value="Ready for download" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <TechnicalDetailsToggle>
                        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6">
                            <div className="space-y-6">
                                <div className="overflow-hidden rounded-2xl border border-border bg-card/80">
                                    <SectionHeader icon={<Fingerprint className="w-3.5 h-3.5" />} title="Ownership & Verification" />
                                    <div className="p-4 md:p-5 space-y-2">
                                        <SimpleInfoRow label="Ownership Status" value={isVerified ? "Verified" : "Pending"} />
                                        <SimpleInfoRow label="System Status" value={art.status} />
                                        <SimpleInfoRow label="Work ID" value={art.workId ?? "N/A"} mono />
                                        <SimpleInfoRow label="Chain" value={art.chain ?? "N/A"} />
                                        <HashInfoRow label="Transaction Hash" value={art.txHash ?? "N/A"} />
                                        <SimpleInfoRow label="Block Number" value={art.blockNumber !== null ? String(art.blockNumber) : "N/A"} />
                                    </div>
                                </div>

                                <div className="overflow-hidden rounded-2xl border border-border bg-card/80">
                                    <SectionHeader icon={<Hash className="w-3.5 h-3.5" />} title="Hash Records" />
                                    <div className="p-4 md:p-5 space-y-2">
                                        <SimpleInfoRow label="Hash Status" value={art.hashStatus} />
                                        <HashInfoRow label="File Hash" value={art.fileHash} />
                                        <HashInfoRow label="Perceptual Hash" value={art.perceptualHash || "N/A"} />
                                        <HashInfoRow label="Author ID Hash" value={art.authorIdHash ?? "N/A"} />
                                        <HashInfoRow label="Evidence Hash" value={art.evidenceHash ?? "N/A"} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {evidenceText && (
                                    <div className="overflow-hidden rounded-2xl border border-border bg-card/80">
                                        <SectionHeader icon={<ScrollText className="w-3.5 h-3.5" />} title="Evidence Payload" />
                                        <div className="p-4 md:p-5">
                                            <pre className="rounded-xl border border-border bg-background/70 p-4 text-[11px] text-muted-foreground overflow-auto whitespace-pre-wrap leading-6 max-h-80">
                                                {evidenceText}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                {plagiarismText && (
                                    <div className="overflow-hidden rounded-2xl border border-border bg-card/80">
                                        <SectionHeader icon={<ScanSearch className="w-3.5 h-3.5" />} title="Stored Plagiarism Payload" />
                                        <div className="p-4 md:p-5">
                                            <pre className="rounded-xl border border-border bg-background/70 p-4 text-[11px] text-muted-foreground overflow-auto whitespace-pre-wrap leading-6 max-h-80">
                                                {plagiarismText}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                <div className="rounded-2xl border border-blue-500/15 bg-blue-500/5 p-4 flex gap-3">
                                    <Shield className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-500/90 mb-1">
                                            Integrity Notice
                                        </p>
                                        <p className="text-xs text-muted-foreground leading-5">
                                            All hashes are computed at upload time and stored immutably. The evidence hash seals the complete submission payload including file metadata, perceptual hash, and user identity hash.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TechnicalDetailsToggle>
                </div>
            </div>
        </main>
    );
}